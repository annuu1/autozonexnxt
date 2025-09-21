// app/api/v1/users/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";

// GET all users (optionally filter by role or search)
export async function GET(req: Request) {
  // Only admin or manager can list users
  const auth = await requireAuth(req, { rolesAllowed: ["admin", "manager", "associate"] });
  if (!("ok" in auth) || !auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const userId = auth.user?._id;
    const userRoles = auth.user?.roles || [];

    let query: any = {};
    if (role) query.roles = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Role-based access
    if (userRoles.includes("associate")) {
      // Associates can only see users they invited
      query.invitedBy = userId;
    } else if (!userRoles.includes("admin") && !userRoles.includes("manager")) {
      // Just a safety check: no other roles can list users
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

    const users = await User.find(query).limit(500);

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// CREATE a new user
export async function POST(req: Request) {
  // Only admin can create users directly
  const auth = await requireAuth(req, { rolesAllowed: ["admin"] });
  if (!("ok" in auth) || !auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

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
