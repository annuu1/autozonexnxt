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
    const teamPicks = await TeamPick.find({ type: "zone" }).lean();

    if (!teamPicks.length) {
      return NextResponse.json([]);
    }

    // Convert string ids to ObjectId
    const itemIds = teamPicks.map((pick) =>
      new mongoose.Types.ObjectId(pick.itemId)
    );

    const zones = await DemandZone.find({ _id: { $in: itemIds } }).lean();

    return NextResponse.json(zones);
  } catch (err) {
    console.error("Error fetching team picks:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
