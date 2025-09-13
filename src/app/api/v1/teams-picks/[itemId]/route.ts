import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import TeamPick from "@/models/TeamPick";

// Remove Team Pick
export async function DELETE(
  req: Request,
  { params }: { params: { itemId: string } }
) {
  await dbConnect();

  const { itemId } = params;

  await TeamPick.findOneAndDelete({ itemId });

  return NextResponse.json({ success: true });
}
