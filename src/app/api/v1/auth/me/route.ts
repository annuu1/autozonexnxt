// app/api/v1/auth/me/route.ts
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    id: user._id,
    name: user.name,
    email: user.email,
    roles: user.roles,
    subscription: user.subscription,
  });
}
