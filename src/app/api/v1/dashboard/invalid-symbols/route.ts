import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Symbol from "@/models/Symbols"; // your model

export async function GET() {
  await dbConnect();
  // Example: invalid means no company_name or status != active
  const symbols = await Symbol.find({ status: { $ne: "active" } });
  return NextResponse.json(symbols);
}
