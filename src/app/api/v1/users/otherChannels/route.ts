// app/api/v1/users/otherChannels/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import mongoose from "mongoose";

// POST to add or update other channels for the authenticated user
export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if (!("ok" in auth) || !auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const { channel, id } = body;

    if (!channel || id === undefined) {
      return NextResponse.json(
        { error: "Channel and id are required" },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(auth.user._id);
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Initialize other_channels if it doesn't exist
    if (!user.other_channels) {
      user.other_channels = [];
    }

    // Check if channel already exists and update it
    const existingIndex = user.other_channels.findIndex((ch: any) => ch.channel === channel);
    if (existingIndex > -1) {
      user.other_channels[existingIndex] = { channel, id };
    } else {
      // Add new channel
      user.other_channels.push({ channel, id });
    }

    console.log("Updated user:", user);

    await user.save();

    return NextResponse.json({ message: "Other channel updated successfully", other_channels: user.other_channels });
  } catch (error: any) {
    console.error("Error updating other channels:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}