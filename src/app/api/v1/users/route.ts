// app/api/v1/users/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

// GET all users (optionally filter by role or search)
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    let query: any = {};
    if (role) query.roles = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query).limit(50);

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// CREATE a new user
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.email || !body.passwordHash) {
      return NextResponse.json(
        { error: "Email and passwordHash required" },
        { status: 400 }
      );
    }

    const user = await User.create(body);

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
