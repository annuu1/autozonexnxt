// app/api/v1/reactions/batch/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Reaction from "@/models/Reaction";
import TeamPick from "@/models/TeamPick";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: Request) {
  await dbConnect();
  const { itemIds } = await req.json();

  if (!itemIds || !Array.isArray(itemIds)) {
    return NextResponse.json({ error: "itemIds required" }, { status: 400 });
  }

  const user = await getUserFromRequest(req);

  // Fetch reactions & team picks
  const [reactions, teamPicks] = await Promise.all([
    Reaction.find({ itemId: { $in: itemIds } }),
    TeamPick.find({ itemId: { $in: itemIds } }),
  ]);

  const grouped: Record<
    string,
    {
      counts: Record<string, number>;
      userReaction: string | null;
      isTeamPick: boolean;
    }
  > = {};

  for (const id of itemIds) {
    grouped[id] = {
      counts: { "👍": 0, "👎": 0, "🚀": 0 },
      userReaction: null,
      isTeamPick: false,
    };
  }

  reactions.forEach((r) => {
    grouped[r.itemId].counts[r.reaction] =
      (grouped[r.itemId].counts[r.reaction] || 0) + 1;

    if (user && r.userId.toString() === user._id.toString()) {
      grouped[r.itemId].userReaction = r.reaction;
    }
  });

  teamPicks.forEach((tp) => {
    grouped[tp.itemId].isTeamPick = true;
  });

  return NextResponse.json(grouped);
}
