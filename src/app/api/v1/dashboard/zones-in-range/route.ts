import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DemandZone from "@/models/DemandZone";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request) {

    // 🔹 Require authentication
    const auth = await requireAuth(req, {
      rolesAllowed: ["user", "agent", "manager", "admin"],
    });
    if (!("ok" in auth) || !auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await dbConnect();

    const zones = await DemandZone.aggregate([
    {
      $lookup: {
        from: "symbols",
        localField: "ticker",
        foreignField: "symbol",
        as: "symbol",
      },
    },
    { $unwind: "$symbol" },
    {
      $addFields: {
        percentDiff: {
          $abs: {
            $divide: [
              { $subtract: ["$proximal_line", "$symbol.day_low"] },
              "$symbol.day_low",
            ],
          },
        },
      },
    },
    {
      $match: {
        percentDiff: { $lte: 0.03 }, // within 3% of day low
        freshness: { $gt: 0 },
      },
    },
    {
      $project: {
        _id: 1,
        zone_id: 1,
        ticker: 1,
        proximal_line: 1,
        distal_line: 1,
        pattern: 1,
        freshness: 1,
        trade_score: 1,
        day_low: "$symbol.day_low",
        percentDiff: 1,
        last_seen: 1,
      },
    },
    {
      $sort: { freshness: -1 }, // fresher zones first
    },
  ]);

  return NextResponse.json(zones);
}
