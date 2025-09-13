// app/api/v1/teampick/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import TeamPick from "@/models/TeamPick";
import { getUserFromRequest } from "@/lib/auth";

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
