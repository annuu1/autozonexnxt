import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DemandZone from "@/models/DemandZone";
import { requireAuth } from "@/lib/auth";

// ✅ GET /api/v1/dashboard/zone
export async function GET(req: Request) {
  const auth = await requireAuth(req, {
    rolesAllowed: ["user", "agent", "manager", "admin"],
  });
  if (!("ok" in auth) || !auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  await dbConnect();

  try {
    const zones = await DemandZone.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(zones);
  } catch (err: any) {
    console.error("Fetch zones error:", err);
    return NextResponse.json(
      { error: "Failed to fetch zones" },
      { status: 500 }
    );
  }
}

// ✅ POST /api/v1/dashboard/zone
export async function POST(req: Request) {
  const auth = await requireAuth(req, {
    rolesAllowed: ["manager", "admin"],
  });
  if (!("ok" in auth) || !auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  await dbConnect();

  try {
    const body = await req.json();
    const zone = new DemandZone(body);
    await zone.save();
    return NextResponse.json(zone, { status: 201 });
  } catch (err: any) {
    console.error("Create zone error:", err);
    return NextResponse.json(
      { error: "Failed to create zone" },
      { status: 500 }
    );
  }
}
