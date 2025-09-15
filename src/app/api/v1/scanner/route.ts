import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DemandZone from "@/models/DemandZone";

export async function GET(req: Request) {
  await dbConnect();

  // get query params for filters
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") || "approaching"; // default
  const timeframeFilter = searchParams.get("timeframe") || "all";

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
        status: statusFilter, // "approaching" or "entered"
        ...(timeframeFilter !== "all" && {
          $expr: { $eq: [{ $arrayElemAt: ["$timeframes", 0] }, timeframeFilter] },
        }),
      },
    },
    {
      $sort: { distanceFromProximal: 1},
    },
  ]);

  return NextResponse.json(zones);
}
