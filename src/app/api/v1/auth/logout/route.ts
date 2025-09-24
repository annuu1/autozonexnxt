// app/api/v1/auth/logout/route.ts
import { NextResponse } from "next/server";
import { clearAuthCookie, getTokenFromRequest, verifyJwt } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  // Best-effort invalidate server-side session
  try {
    const token = getTokenFromRequest(req);
    const decoded = token ? verifyJwt<{ id: string }>(token) : null;
    if (decoded?.id) {
      await dbConnect();
      await User.findByIdAndUpdate(decoded.id, { $set: { sessionId: null } });
    }
  } catch (e) {
    // non-fatal
  }

  const res = NextResponse.json({ success: true });
  clearAuthCookie(res);
  return res;
}
