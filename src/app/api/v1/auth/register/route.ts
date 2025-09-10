// app/api/v1/auth/register/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword, signJwt, setAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, email, password, roles, plan } = body || {};

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      passwordHash,
      roles: Array.isArray(roles) && roles.length ? roles : undefined,
      subscription: plan ? { plan, status: "active", startDate: new Date() } : undefined,
    });

    const token = signJwt({ id: user._id.toString() });
    const res = NextResponse.json(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        subscription: user.subscription,
      },
      { status: 201 }
    );

    setAuthCookie(res, token);
    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
