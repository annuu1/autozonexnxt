import { NextResponse } from "next/server";
import TradeAnalysis from "@/models/TradeAnalysis";
import dbConnect from "@/lib/mongodb";

// GET all trades
export async function GET() {
  try {
    await dbConnect();
    const trades = await TradeAnalysis.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: trades });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST a new trade
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const newTrade = await TradeAnalysis.create(body);

    return NextResponse.json({ success: true, data: newTrade }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
