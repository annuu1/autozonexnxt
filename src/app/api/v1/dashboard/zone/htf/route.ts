// src/app/api/v1/dashboard/zone/htf/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import DemandZone from "@/models/DemandZone";

export async function GET(req: Request) {
  // 1️⃣ Auth
  const auth = await requireAuth(req, {
    rolesAllowed: ["user", "agent", "manager", "admin"],
    minPlan: "starter",
  });

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get("timeframe");
    if (!timeframe) {
      return NextResponse.json({ error: "Missing timeframe parameter" }, { status: 400 });
    }

    // 2️⃣ Query: freshness === 1.5 OR (zone_entry_sent === true AND freshness > 0)
    const zones = await DemandZone.find({
      "timeframes.0": timeframe,
      $or: [
        { freshness: 1.5 },
        { $and: [{ zone_entry_sent: true }, { freshness: { $gt: 0 } }] },
      ],
    }).lean();

    return NextResponse.json({ zones });
  } catch (err: any) {
    console.error("HTF Zone API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
