import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import DemandZone from "@/models/DemandZone";
import Symbols from "@/models/Symbols";
import { requireAuth } from "@/lib/auth";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

export async function GET(req: Request) {
  const auth = await requireAuth(req, {
    rolesAllowed: ["user", "agent", "manager", "admin"],
  });
  if (!("ok" in auth) || !auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  await dbConnect();

  const url = new URL(req.url);
  const dateParam = url.searchParams.get("date");
  const selectedDate = dateParam ? new Date(dateParam) : new Date();
  selectedDate.setHours(0, 0, 0, 0);

  // Cache key based on selected date
  const dateKey = selectedDate.toISOString().split("T")[0];
  const cacheKey = `dashboard-stats-${dateKey}`;

  // Check Redis cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  }

  // Fetch all stats in parallel for better performance
  const [
    users,
    demandZones,
    symbols,
    invalidSymbols,
    outdatedSymbols,
    zonesInRange,
  ] = await Promise.all([
    User.countDocuments(),
    DemandZone.countDocuments(),
    Symbols.countDocuments(),
    Symbols.countDocuments({
      $or: [
        { ltp: null },
        { ltp: { $exists: false } },
        { ltp: { $type: "string" } },
        { status: "inactive" },
      ],
    }),
    Symbols.countDocuments({
      last_updated: { $lt: selectedDate },
    }),
    DemandZone.aggregate([
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
            $cond: {
              if: {
                $or: [
                  { $eq: ["$symbol.day_low", null] },
                  { $eq: ["$symbol.day_low", 0] }
                ]
              },
              then: 1,  // High value to exclude from "in range" match
              else: {
                $abs: {
                  $divide: [
                    { $subtract: ["$proximal_line", "$symbol.day_low"] },
                    "$symbol.day_low",
                  ],
                },
              },
            },
          },
        },
      },
      { $match: { percentDiff: { $lte: 0.03 }, freshness: { $gt: 0 } } },
      { $count: "count" },
    ]),
  ]);

  const zonesNearDayLow = zonesInRange.length > 0 ? zonesInRange[0].count : 0;

  const stats = {
    users,
    demandZones,
    symbols,
    invalidSymbols,
    outdatedSymbols,
    zonesNearDayLow,
  };

  // Cache for 4 hours (14400 seconds)
  await redis.set(cacheKey, stats, { ex: 14400 });

  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}