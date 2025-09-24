import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Otp from "@/models/Otp";
import { generateOtp, hashOtp } from "@/lib/otp";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email, purpose } = body;

    if (!email || !purpose) {
      return NextResponse.json({ error: "Email and purpose are required" }, { status: 400 });
    }

    // Clean up old OTPs for same email & purpose
    await Otp.deleteMany({ email, purpose, verified: false });

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await Otp.create({
      email,
      otpHash,
      purpose,
      expiresAt,
    });

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Your OTP for ${purpose}`,
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    });

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
