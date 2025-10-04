import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Alert from "@/models/Alert";
import { getUserFromRequest } from "@/lib/auth";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// GET all alerts
export async function GET(req: Request) {
    try {
      await dbConnect();
      const user = await getUserFromRequest(req);
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
      const cacheKey = `alerts:${user._id}`;
      const cached = await redis.get(cacheKey);
  
      if (cached && cached !== "null" && cached !== "") {
        try {
          const parsed = JSON.parse(cached);
          return NextResponse.json(parsed);
        } catch {
          // corrupted cache, ignore it
          await redis.del(cacheKey);
        }
      }
  
      const alerts = await Alert.find({ userId: user._id }).sort({ createdAt: -1 });
  
      // Cache the result even if empty
      await redis.set(cacheKey, JSON.stringify(alerts), { ex: 60 });
  
      return NextResponse.json(alerts);
    } catch (error: any) {
      console.error("GET /alert error:", error);
      return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
    }
  }
  

// POST new alert
export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.symbol || !data.condition || !data.price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newAlert = await Alert.create({
      userId: user._id,
      symbol: data.symbol,
      condition: data.condition,
      price: data.price,
      active: data.active ?? true,
      note: data.note ?? "",
    });

    await redis.del(`alerts:${user._id}`);
    return NextResponse.json(newAlert, { status: 201 });
  } catch (error: any) {
    console.error("POST /alert error:", error);
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
  }
}

// PUT (update alert)
export async function PUT(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.id) return NextResponse.json({ error: "Missing alert id" }, { status: 400 });

    const updated = await Alert.findOneAndUpdate(
      { _id: data.id, userId: user._id },
      data,
      { new: true }
    );

    if (!updated) return NextResponse.json({ error: "Alert not found" }, { status: 404 });

    await redis.del(`alerts:${user._id}`);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /alert error:", error);
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}

// DELETE alert
export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing alert id" }, { status: 400 });

    const deleted = await Alert.findOneAndDelete({ _id: id, userId: user._id });
    if (!deleted) return NextResponse.json({ error: "Alert not found" }, { status: 404 });

    await redis.del(`alerts:${user._id}`);
    return NextResponse.json({ message: "Alert deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /alert error:", error);
    return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 });
  }
}
