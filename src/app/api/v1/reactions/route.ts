import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Reaction from "@/models/Reaction";
import { getUserFromRequest } from "@/lib/auth";

// Get reactions for item
export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");

  if (!itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 });
  }

  // Try to get logged-in user (may be null if not logged in)
  const user = await getUserFromRequest(req);

  const reactions = await Reaction.find({ itemId });

  // Count per reaction
  const counts = reactions.reduce<Record<string, number>>(
    (acc, r) => {
      acc[r.reaction] = (acc[r.reaction] || 0) + 1;
      return acc;
    },
    { "👍": 0, "👎": 0, "🚀": 0 }
  );

  // Get user’s reaction if logged in
  const userReaction = user
    ? reactions.find((r) => r.userId.toString() === user._id.toString())?.reaction || null
    : null;

  return NextResponse.json({ counts, userReaction });
}

// Add or update reaction
export async function POST(req: Request) {
  await dbConnect();

  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { itemId, type, reaction } = body;

  if (!itemId || !type || !reaction) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await Reaction.findOneAndUpdate(
    { itemId, type, userId: user._id },
    { reaction },
    { upsert: true, new: true }
  );

  // Recalculate counts
  const reactions = await Reaction.find({ itemId });
  const counts = reactions.reduce<Record<string, number>>(
    (acc, r) => {
      acc[r.reaction] = (acc[r.reaction] || 0) + 1;
      return acc;
    },
    { "👍": 0, "👎": 0, "🚀": 0 }
  );

  return NextResponse.json({ counts, userReaction: reaction });
}
