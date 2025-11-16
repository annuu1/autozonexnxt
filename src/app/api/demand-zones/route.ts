import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DemandZone from "@/models/DemandZone";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request) {

    // Require authentication + minimum plan
    const auth = await requireAuth(req, {
      rolesAllowed: ["admin"],
      minPlan: "starter",
    });

    if (!("ok" in auth) || !auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await dbConnect();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  const pipeline = [
    { $sort: { timestamp: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "symbols",             // collection to join
        localField: "ticker",        // field from demand_zones
        foreignField: "symbol",      // field from symbols
        as: "symbol_data",
      },
    },
    { $unwind: { path: "$symbol_data", preserveNullAndEmptyArrays: true } }, // optional
    {
      $project: {
        zone_id: 1,
        base_candles: 1,
        distal_line: 1,
        proximal_line: 1,
        freshness: 1,
        pattern: 1,
        ticker: 1,
        timeframes: 1,
        trade_score: 1,
        timestamp: 1,
        end_timestamp: 1,
        last_seen: 1,
        "symbol_data.ltp": 1,
        "symbol_data.day_low": 1,
      },
    },
  ];

  const [zones, total] = await Promise.all([
    DemandZone.aggregate(pipeline),
    DemandZone.countDocuments(),
  ]);

  return NextResponse.json({
    data: zones,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}
