import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DemandZone from "@/models/DemandZone";
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
});

export async function GET(req: Request) {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") || "approaching";
    const timeframeFilter = searchParams.get("timeframe") || "all";

    const cacheKey = `sectors-zones-${statusFilter}-${timeframeFilter}`;

    let groupedZones: Record<string, any[]> = {};

    const cached = await redis.get(cacheKey);
    if (cached) {
        groupedZones = cached as Record<string, any[]>;
    } else {
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
            // Ensure symbol has sectors
            { $match: { "symbol.sectors": { $exists: true, $ne: [] } } },
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
                    sectors: "$symbol.sectors",
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
                    status: statusFilter,
                    ...(timeframeFilter !== "all" && {
                        $expr: { $eq: [{ $arrayElemAt: ["$timeframes", 0] }, timeframeFilter] },
                    }),
                },
            },
            {
                $sort: { percentDiff: 1 },
            },
        ]);

        // Group by sector
        zones.forEach((zone) => {
            if (zone.sectors && Array.isArray(zone.sectors)) {
                zone.sectors.forEach((sector: string) => {
                    if (!groupedZones[sector]) {
                        groupedZones[sector] = [];
                    }
                    // Avoid duplicates if a symbol is in multiple sectors (it will appear in each sector section)
                    groupedZones[sector].push(zone);
                });
            }
        });

        // Sort sectors alphabetically
        const sortedGroupedZones: Record<string, any[]> = {};
        Object.keys(groupedZones).sort().forEach(key => {
            sortedGroupedZones[key] = groupedZones[key];
        });
        groupedZones = sortedGroupedZones;

        await redis.set(cacheKey, groupedZones, { ex: 3600 });
    }

    return NextResponse.json(groupedZones, {
        headers: {
            "Cache-Control": "private, no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        },
    });
}
