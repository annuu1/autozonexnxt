import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import DemandZone from "@/models/DemandZone";
import Symbols from "@/models/Symbols";

export async function GET(req: Request) {
  await dbConnect();

  const url = new URL(req.url);
  const dateParam = url.searchParams.get("date");
  const selectedDate = dateParam ? new Date(dateParam) : new Date();
  selectedDate.setHours(0, 0, 0, 0);

  // Counts
  const users = await User.countDocuments();
  const demandZones = await DemandZone.countDocuments();
  const symbols = await Symbols.countDocuments();

  const invalidSymbols = await Symbols.countDocuments({
    $or: [
      { ltp: null },
      { ltp: { $exists: false } },
      { ltp: { $type: "string" } },
    ],
  });

  const outdatedSymbols = await Symbols.countDocuments({
    last_updated: { $lt: selectedDate },
  });

  // 🔹 Demand zones within 3% of symbol day_low
  const zonesInRange = await DemandZone.aggregate([
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
    { $match: { percentDiff: { $lte: 0.03 }, freshness: { $gt: 0 } } }, // within 3%
    { $count: "count" },
  ]);

  const zonesNearDayLow = zonesInRange.length > 0 ? zonesInRange[0].count : 0;

  return NextResponse.json({
    users,
    demandZones,
    symbols,
    invalidSymbols,
    outdatedSymbols,
    zonesNearDayLow, // 🔹 new field
  });
}
