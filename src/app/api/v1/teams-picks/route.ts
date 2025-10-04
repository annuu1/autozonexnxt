// app/api/v1/teams-picks/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import TeamPick from "@/models/TeamPick";
import { getUserFromRequest } from "@/lib/auth";
import DemandZone from "@/models/DemandZone";
import mongoose from "mongoose";

export async function POST(req: Request) {
  await dbConnect();
  const { itemId, type } = await req.json();

  if (!itemId || !type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const user = await getUserFromRequest(req);
  if (!user || !["admin", "manager", "agent"].includes(user.roles[0])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await TeamPick.findOne({ itemId, type });
  if (existing) {
    await TeamPick.deleteOne({ _id: existing._id });
    return NextResponse.json({ success: true, isTeamPick: false });
  } else {
    await TeamPick.create({ itemId, type, addedBy: user._id });
    return NextResponse.json({ success: true, isTeamPick: true });
  }
}



// ✅ New GET handler
export async function GET(req: Request) {
  await dbConnect();

  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Extract pagination parameters from query
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20", 10);
    const skip = (page - 1) * pageSize;

    // Fetch team picks with sorting and pagination
    const teamPicks = await TeamPick.find({ type: "zone" })
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order (latest first)
      .skip(skip)
      .limit(pageSize)
      .lean();

    if (!teamPicks.length) {
      return NextResponse.json([]);
    }

    // Convert string ids to ObjectId
    const itemIds = teamPicks.map((pick) =>
      new mongoose.Types.ObjectId(pick.itemId)
    );

    const zones = await DemandZone.find({ _id: { $in: itemIds } }).lean();

    const result = zones
      .map((zone) => {
        const pick = teamPicks.find(
          (p) => p.itemId.toString() === zone._id.toString()
        );
        return {
          ...zone,
          teamPick: pick ? { createdAt: pick.createdAt, ...pick } : null,
        };
      })
      // Sort result by teamPick.createdAt in descending order
      .sort((a, b) => {
        const dateA = a.teamPick?.createdAt
          ? new Date(a.teamPick.createdAt).getTime()
          : 0;
        const dateB = b.teamPick?.createdAt
          ? new Date(b.teamPick.createdAt).getTime()
          : 0;
        return dateB - dateA; // Latest date first
      });

    // Get total count for pagination
    const total = await TeamPick.countDocuments({ type: "zone" });

    return NextResponse.json({
      data: result,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error("Error fetching team picks:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}