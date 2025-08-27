import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Trades from "@/models/Trade";

export async function GET() {
    await dbConnect();
    const trades = await Trades.find({});
    return NextResponse.json(trades);
}