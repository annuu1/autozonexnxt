// app/api/v1/activity-logs/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";

// CREATE activity log
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const log = await ActivityLog.create(body);

    return NextResponse.json(log, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET all activity logs (with filters)
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId");
    const action = searchParams.get("action");

    const filter: any = {};
    if (userId) filter.userId = userId;
    if (action) filter.action = action;

    const logs = await ActivityLog.find(filter).sort({ createdAt: -1 }).limit(100);

    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
