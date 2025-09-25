// app/api/v1/auth/register/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import InviteCode from "@/models/InviteCode";
import { hashPassword, signJwt, setAuthCookie } from "@/lib/auth";
import { nanoid } from "nanoid";
import mongoose from "mongoose";

async function generateUniqueCode(length = 8) {
  let code;
  while (true) {
    code = nanoid(length);
    const exists = await InviteCode.findOne({ code });
    if (!exists) return code;
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, email, mobile, password, referralCode, roles, plan } = body || {};

    if (!name || !email || !mobile || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const mobileExists = await User.findOne({ mobile });
    if (mobileExists) {
      return NextResponse.json({ error: "Mobile number already in use" }, { status: 409 });
    }

    let invitedBy = null;
    if (referralCode) {
      const invite = await InviteCode.findOne({ code: referralCode });
      if (!invite) {
        return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
      }
      invitedBy = invite.owner instanceof mongoose.Types.ObjectId 
  ? invite.owner 
  : invite.owner?._id;
      
  invitedBy = new mongoose.Types.ObjectId(invitedBy);
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      mobile,
      passwordHash,
      invitedBy,
      roles: Array.isArray(roles) && roles.length ? roles : ["user"],
      subscription: plan ? { plan, status: "inactive", startDate: new Date() } : undefined,
    });

    // Generate referral code for new user if they have the "associate" role
    if (user.roles.includes("associate")) {
      const newCode = await generateUniqueCode();
      await InviteCode.create({ code: newCode, owner: user._id });
    }

    const token = signJwt({ id: user._id.toString() });
    const res = NextResponse.json(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
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