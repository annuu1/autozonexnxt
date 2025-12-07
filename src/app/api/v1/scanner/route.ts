import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DemandZone from "@/models/DemandZone";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

export async function GET(req: Request) {
  await dbConnect();

  // get query params for filters
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") || "approaching";
  const timeframeFilter = searchParams.get("timeframe") || "all";
  const searchTerm = searchParams.get("search") || "";
  const marketWatch = searchParams.get("market_watch") || "nifty_200";
  const sector = searchParams.get("sector") || "";
  const watchlist = searchParams.get("watchlist") || "";

  // 🔑 Cache key based on status, timeframe, marketWatch, sector, watchlist
  const cacheKey = `zones-${statusFilter}-${timeframeFilter}-${marketWatch}-${sector}-${watchlist}`;

  let zones: any[];

  // Check Redis cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    zones = cached as any[];
  } else {
    // Construct market watch filter
    let marketWatchFilter: any = {};
    if (marketWatch !== "all") {
      if (marketWatch === "small_cap") {
        marketWatchFilter = { "symbol.watchlists": { $regex: "Smallcap", $options: "i" } };
      } else if (marketWatch === "mid_cap") {
        marketWatchFilter = { "symbol.watchlists": { $regex: "Midcap", $options: "i" } };
      } else if (marketWatch === "large_cap") {
        marketWatchFilter = { "symbol.watchlists": "Nifty 100" };
      } else {
        // nifty_50 -> Nifty 50, etc.
        const label = marketWatch.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
        marketWatchFilter = { "symbol.watchlists": label };
      }
    }

    // Fetch from database
    zones = await DemandZone.aggregate([
      {
        $lookup: {
          from: "symbols",
          localField: "ticker",
          foreignField: "symbol",
          as: "symbol",
        },
      },
      { $unwind: "$symbol" },
      // Filter by market watch
      ...(marketWatch !== "all" ? [{ $match: marketWatchFilter }] : []),
      // Filter by sector
      ...(sector ? [{ $match: { "symbol.sectors": sector } }] : []),
      // Filter by watchlist (explicit)
      ...(watchlist ? [{ $match: { "symbol.watchlists": watchlist } }] : []),
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
          isApproaching: {
            $and: [
              { $gte: ["$symbol.day_low", "$proximal_line"] },
              { $lte: ["$symbol.day_low", { $multiply: ["$proximal_line", 1.03] }] },
            ],
          },
          isEntered: {
            $and: [
              { $lt: ["$symbol.day_low", "$proximal_line"] },
              { $gt: ["$symbol.day_low", "$distal_line"] },
            ],
          },
        },
      },
      {
        $match: {
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
          rating: 1,
          day_low: "$symbol.day_low",
          last_price: "$symbol.last_price",
          percentDiff: 1,
          timeframes: 1,
          zone_alert_sent: { $ifNull: ["$zone_alert_sent", false] },
          zone_entry_sent: { $ifNull: ["$zone_entry_sent", false] },
          status: {
            $cond: [
              "$isEntered",
              "entered",
              { $cond: ["$isApproaching", "approaching", "other"] },
            ],
          },
          timestamp: 1,
        },
      },
      {
        $match: {
          status: statusFilter, // Filter by status
          ...(timeframeFilter !== "all" && {
            $expr: { $eq: [{ $arrayElemAt: ["$timeframes", 0] }, timeframeFilter] },
          }),
        },
      },
      {
        $sort: { distanceFromProximal: 1 },
      },
    ]);

    // Save to Redis with 1-hour TTL
    await redis.set(cacheKey, zones, { ex: 3600 });
  }

  // Apply search filter (works on both cached and fresh data)
  // This filters within the already status+timeframe-filtered data
  if (searchTerm) {
    zones = zones.filter((zone: any) =>
      zone.ticker.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return NextResponse.json(zones, {
    headers: {
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}