import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DemandZone from "@/models/DemandZone";

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const skip = (page - 1) * limit;

  const [zones, total] = await Promise.all([
    DemandZone.find({})
      .sort({ timestamp: -1 }) // newest first
      .skip(skip)
      .limit(limit),
    DemandZone.countDocuments(),
  ]);

  return NextResponse.json({
    data: zones,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}
