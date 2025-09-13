import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import TeamPick from "@/models/TeamPick";
import { getUserFromRequest } from "@/lib/auth";

// Get Team Pick for item
export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");

  if (!itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 });
  }

  const teamPick = await TeamPick.findOne({ itemId });

  return NextResponse.json({
    teamPick: !!teamPick,
    addedBy: teamPick?.addedBy || null,
  });
}

// Add Team Pick
export async function POST(req: Request) {
  await dbConnect();

  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowedRoles = ["admin", "manager", "agent"];
  if (!allowedRoles.includes(user.roles[0])) {
    return NextResponse.json({ error: "Forbidden: insufficient role" }, { status: 403 });
  }

  const body = await req.json();
  const { itemId, type } = body;

  if (!itemId || !type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await TeamPick.findOneAndUpdate(
    { itemId, type },
    { addedBy: user._id },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true });
}

// Remove Team Pick
export async function DELETE(req: Request) {
  await dbConnect();

  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowedRoles = ["admin", "manager", "agent"];
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden: insufficient role" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");

  if (!itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 });
  }

  await TeamPick.findOneAndDelete({ itemId });

  return NextResponse.json({ success: true });
}
