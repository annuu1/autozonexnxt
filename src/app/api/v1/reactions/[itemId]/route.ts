// app/api/v1/reactions/[itemId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Reaction from "@/models/Reaction";
import TeamPick from "@/models/TeamPick";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  await dbConnect();
  const { itemId } = params;

  const user = await getUserFromRequest(req);

  // Find all reactions for this item
  const reactions = await Reaction.find({ itemId });

  // Count grouped by reaction type
  const counts = reactions.reduce(
    (acc, r) => {
      acc[r.reaction] = (acc[r.reaction] || 0) + 1;
      return acc;
    },
    { "👍": 0, "👎": 0, "🚀": 0 }
  );

  // Find this user’s reaction
  const userReaction = reactions.find((r) => r.userId === user?._id?.toString())?.reaction || null;

  // Check if in team’s pick
  const teamPick = !!(await TeamPick.findOne({ itemId }));

  return NextResponse.json({ counts, userReaction, teamPick });
}
