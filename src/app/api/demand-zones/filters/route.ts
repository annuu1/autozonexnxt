import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DemandZone from "@/models/DemandZone";

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  const proximalWithin = parseFloat(searchParams.get("proximalWithin") || "0"); // % threshold
  const compareTo = searchParams.get("compareTo") || "ltp"; // ltp | day_low

  const pipeline: any[] = [
    {
      $lookup: {
        from: "symbols",
        localField: "ticker",
        foreignField: "symbol",
        as: "symbol_data",
      },
    },
    { $unwind: { path: "$symbol_data", preserveNullAndEmptyArrays: true } },
  ];

  // ✅ Apply filter if provided
  if (proximalWithin > 0) {
    pipeline.push({
      $match: {
        $expr: {
          $lte: [
            {
              $abs: {
                $divide: [
                  { $subtract: ["$proximal_line", `$symbol_data.${compareTo}`] },
                  `$symbol_data.${compareTo}`,
                ],
              },
            },
            proximalWithin / 100,
          ],
        },
      },
    });
  }

  // ✅ Sort by freshness highest → lowest
  pipeline.push({ $sort: { freshness: -1 } });

  // ✅ Pagination after filtering + sorting
  pipeline.push({ $skip: skip }, { $limit: limit });

  // Final projection
  pipeline.push({
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
  });

  // For total count AFTER filter
  const countPipeline = pipeline.filter(
    (stg) => !("$skip" in stg) && !("$limit" in stg) && !("$project" in stg) && !("$sort" in stg)
  );
  countPipeline.push({ $count: "total" });

  const [zones, countResult] = await Promise.all([
    DemandZone.aggregate(pipeline),
    DemandZone.aggregate(countPipeline),
  ]);

  const total = countResult[0]?.total || 0;

  return NextResponse.json({
    data: zones,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}
