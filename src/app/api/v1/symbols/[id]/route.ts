import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Symbol from "@/models/Symbols";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  await Symbol.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const body = await req.json();
  const updated = await Symbol.findByIdAndUpdate(params.id, body, { new: true });
  return NextResponse.json(updated);
}
