import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DemandZone from "@/models/DemandZone";

export async function GET() {
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
    { $match: { percentDiff: { $lte: 0.03 } } },
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
      },
    },
  ]);

  return NextResponse.json(zones);
}
