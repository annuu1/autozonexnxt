import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SymbolModel from "@/models/Symbols";

// GET all symbols
export async function GET() {
  await dbConnect();
  const symbols = await SymbolModel.find({});
  return NextResponse.json(symbols);
}

// UPDATE symbol by ID
export async function PUT(req: Request) {
  try {
    await dbConnect();
    const { id, updates } = await req.json();

    if (!id || !updates) {
      return NextResponse.json({ error: "ID and updates required" }, { status: 400 });
    }

    const updatedSymbol = await SymbolModel.findByIdAndUpdate(id, updates, { new: true });

    return NextResponse.json(updatedSymbol);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
