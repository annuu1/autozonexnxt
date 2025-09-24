// app/api/v1/auth/login/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { verifyPassword, signJwt, setAuthCookie } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    user.lastLogin = new Date();
    if (!user.mobile) {
      user.mobile = "0000000000";
    }
    // Generate new sessionId to enforce single-device login
    const sessionId = randomUUID();
    user.sessionId = sessionId;
    await user.save();

    const token = signJwt({ id: user._id.toString(), sid: sessionId });
    const res = NextResponse.json(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        roles: user.roles,
        subscription: user.subscription,
      },
      { status: 200 }
    );

    setAuthCookie(res, token);
    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
