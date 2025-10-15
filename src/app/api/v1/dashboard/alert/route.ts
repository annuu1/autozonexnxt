import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Alert from "@/models/Alert";
import { getUserFromRequest } from "@/lib/auth";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Helper to parse pagination params
const getPaginationParams = (searchParams: URLSearchParams) => {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "12", 10))); // Cap at 100 for safety
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// GET all alerts with pagination, search, and status filter
export async function GET(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    // Build query filters
    const baseQuery = { userId: user._id };
    let query = { ...baseQuery };

    // Status filter (using 'active' boolean field)
    if (status !== 'all') {
      query.active = status === 'active';
    }

    // Search filter (across symbol and note, case-insensitive partial match)
    // Note: Assuming 'note' field exists based on frontend; adjust if needed
    if (search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
      query.$or = [
        { symbol: searchRegex },
        { note: searchRegex }, // Remove if no 'note' field
      ];
    }

    const cacheKey = `alerts:${user._id}:${page}:${limit}:${status}:${search}`;
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

    // Get total count with filters
    const total = await Alert.countDocuments(query);

    // Get paginated alerts with filters
    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const response = { alerts, total };

    // Cache the result even if empty
    await redis.set(cacheKey, JSON.stringify(response), { ex: 60 });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("GET /alert error:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

// Helper function to escape regex special chars (add this if not existing)
function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
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
