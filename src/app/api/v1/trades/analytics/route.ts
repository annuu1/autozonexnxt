import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Trades from "@/models/Trade";
import { requireAuth } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(req: Request) {
    const auth = await requireAuth(req, { rolesAllowed: ["user", "agent", "manager", "admin", "associate"] });
    if (!auth.ok || !auth.user) {
        return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: auth.status ?? 401 });
    }

    try {
        await dbConnect();
        const userId = new mongoose.Types.ObjectId(auth.user._id);

        const pipeline: any[] = [
            { $match: { userId: userId, status: { $ne: "Open" } } }, // Only closed trades for analytics usually
            {
                $facet: {
                    overall: [
                        {
                            $group: {
                                _id: null,
                                totalTrades: { $sum: 1 },
                                totalPnL: { $sum: "$pnl.net" },
                                wins: {
                                    $sum: {
                                        $cond: [{ $gt: ["$pnl.net", 0] }, 1, 0],
                                    },
                                },
                                losses: {
                                    $sum: {
                                        $cond: [{ $lte: ["$pnl.net", 0] }, 1, 0],
                                    },
                                },
                                avgWin: {
                                    $avg: { $cond: [{ $gt: ["$pnl.net", 0] }, "$pnl.net", null] }
                                },
                                avgLoss: {
                                    $avg: { $cond: [{ $lte: ["$pnl.net", 0] }, "$pnl.net", null] }
                                },
                                maxWin: { $max: "$pnl.net" },
                                maxLoss: { $min: "$pnl.net" },
                            },
                        },
                    ],
                    bySetup: [
                        { $match: { "pre_trade.setup_name": { $exists: true, $ne: "" } } },
                        {
                            $group: {
                                _id: "$pre_trade.setup_name",
                                count: { $sum: 1 },
                                pnl: { $sum: "$pnl.net" },
                                wins: { $sum: { $cond: [{ $gt: ["$pnl.net", 0] }, 1, 0] } },
                            },
                        },
                        { $sort: { pnl: -1 } },
                    ],
                    byEmotion: [
                        { $unwind: "$post_trade.emotions" },
                        {
                            $group: {
                                _id: "$post_trade.emotions",
                                count: { $sum: 1 },
                                pnl: { $sum: "$pnl.net" }
                            }
                        },
                        { $sort: { count: -1 } }
                    ],
                    byDay: [
                        {
                            $group: {
                                _id: { $dayOfWeek: "$date" },
                                count: { $sum: 1 },
                                pnl: { $sum: "$pnl.net" },
                                wins: { $sum: { $cond: [{ $gt: ["$pnl.net", 0] }, 1, 0] } }
                            }
                        },
                        { $sort: { "_id": 1 } }
                    ]
                },
            },
        ];

        const results = await Trades.aggregate(pipeline);
        const stats = results[0];

        // Calculate derived metrics
        const overall = stats.overall[0] || { totalTrades: 0, totalPnL: 0, wins: 0, losses: 0 };
        const winRate = overall.totalTrades > 0 ? (overall.wins / overall.totalTrades) * 100 : 0;

        // Psychology Score (Heuristic: 100 base - 5 per mistake - 2 per negative emotion + bonuses)
        // For now, simpler: Win Rate * 0.5 + Consistency * 0.5?
        // Let's rely on data if we can, but since we are not analyzing individual trades deeply here, return undefined or basic.

        return NextResponse.json({
            period: "All Time",
            summary: {
                ...overall,
                winRate: parseFloat(winRate.toFixed(2)),
                profitFactor: overall.avgLoss !== 0 ? Math.abs(overall.avgWin / overall.avgLoss).toFixed(2) : "N/A"
            },
            breakdown: {
                setup: stats.bySetup,
                emotion: stats.byEmotion,
                dayOfWeek: stats.byDay
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
