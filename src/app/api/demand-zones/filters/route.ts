import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DemandZone from "@/models/DemandZone";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request) {
  // Require authentication + minimum plan
  const auth = await requireAuth(req, {
    rolesAllowed: ["admin", "manager"],
    minPlan: "starter",
  });

  if (!("ok" in auth) || !auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const includeSeen = searchParams.get("includeSeen") === "true";

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  const proximalWithin = parseFloat(searchParams.get("proximalWithin") || "0");
  const compareTo = searchParams.get("compareTo") || "ltp"; // ltp | day_low

  // Min 3% above proximal, max = proximalWithin or 10%
  const minPct = 0.03;
  const maxPct = (proximalWithin || 10) / 100;

  // Dynamic field reference (IMPORTANT)
  const compareField = `$symbol_data.${compareTo}`;

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

  // ⭐ NEW — Filter based on last_seen
  if (!includeSeen) {
    pipeline.push({
      $match: {
        last_seen: { $exists: false },
      },
    });
  }

  // ===============================
  // ⭐ ADVANCED FILTER:
  // Price must be:
  // 1) At least 3% ABOVE proximal
  // 2) Within maxPct distance from proximal
  // ===============================
  pipeline.push({
    $match: {
      $expr: {
        $and: [
          // Condition 1: price >= proximal + 3%
          {
            $gte: [
              {
                $divide: [
                  { $subtract: [compareField, "$proximal_line"] },
                  "$proximal_line",
                ],
              },
              minPct,
            ],
          },

          // Condition 2: |proximal - price| / price <= maxPct
          {
            $lte: [
              {
                $abs: {
                  $divide: [
                    { $subtract: ["$proximal_line", compareField] },
                    compareField,
                  ],
                },
              },
              maxPct,
            ],
          },
        ],
      },
    },
  });

  // Sort zones — freshest first
  pipeline.push({ $sort: { freshness: -1 } });

  // Pagination
  pipeline.push({ $skip: skip }, { $limit: limit });

  // Final output fields
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

  // Count pipeline (same filters but no pagination)
  const countPipeline = [
    ...pipeline.filter(
      (stg) =>
        !("$skip" in stg) &&
        !("$limit" in stg) &&
        !("$project" in stg) &&
        !("$sort" in stg)
    ),
    { $count: "total" },
  ];

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
