import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

// GET /api/users
export async function GET() {
  await dbConnect();
  const users = await User.find({});
  return NextResponse.json(users);
}

// POST /api/users
export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const newUser = await User.create(body);
  return NextResponse.json(newUser);
}
