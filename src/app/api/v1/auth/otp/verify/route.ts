import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Otp from "@/models/Otp";
import { verifyOtpHash } from "@/lib/otp";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email, purpose, otp } = body;

    if (!email || !purpose || !otp) {
      return NextResponse.json({ error: "Email, purpose and otp are required" }, { status: 400 });
    }

    const record = await Otp.findOne({ email, purpose, verified: false });

    if (!record) {
      return NextResponse.json({ error: "No OTP found or already verified" }, { status: 400 });
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    const isValid = await verifyOtpHash(otp, record.otpHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    record.verified = true;
    await record.save();

    return NextResponse.json({ message: "OTP verified successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
