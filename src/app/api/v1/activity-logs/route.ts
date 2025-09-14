// app/api/v1/activity-logs/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";
import { logActivity } from "@/lib/logActivity";
import User from "@/models/User";
import { Types } from "mongoose";

// CREATE activity log
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const log = await ActivityLog.create(body);

    // After inserting, check total count
    const total = await ActivityLog.countDocuments();

    if (total > 3000) {
      // delete the oldest 2000 records
      await ActivityLog.find({})
        .sort({ createdAt: 1 }) // oldest first
        .limit(2000)
        .then((oldLogs) => {
          const ids = oldLogs.map((l) => l._id);
          return ActivityLog.deleteMany({ _id: { $in: ids } });
        });
    }

    return NextResponse.json(log, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// get activity logs
export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId");
    const action = searchParams.get("action");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const filter: any = {};
    if (userId) filter.userId = userId;
    if (action) filter.action = action;

    const skip = (page - 1) * limit;

    // Get logs without populate first
    const rawLogs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Map logs with user details
    const logs = await Promise.all(
      rawLogs.map(async (log) => {
        let userDetails: any = null;
    
        if (log.userId && log.userId.toLowerCase() !== "guest") {
          try {
            // Convert string ID to ObjectId
            const user = await User.findById(new Types.ObjectId(log.userId))
              .select("name email roles subscription")
              .lean();
            if (user) userDetails = user;
          } catch {
            // invalid ObjectId or user not found
            userDetails = null;
          }
        } else if (typeof log.userId === "string" && log.userId.toLowerCase() === "guest") {
          userDetails = {
            name: "Guest User",
            email: null,
            roles: ["guest"],
            subscription: null,
          };
        }
    
        return {
          ...log,
          user: userDetails,
        };
      })
    );

    const total = await ActivityLog.countDocuments(filter);

    return NextResponse.json({
      data: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}