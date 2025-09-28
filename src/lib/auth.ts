// lib/auth.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  console.warn("JWT_SECRET not set. Please add JWT_SECRET to your environment.");
}

export type Role = "user" | "agent" | "manager" | "admin" | "associate";
export type Plan = "freemium" | "starter" | "pro";

const PLAN_LEVEL: Record<Plan, number> = {
  freemium: 0,
  starter: 1,
  pro: 2,
};

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function signJwt(payload: object, options?: jwt.SignOptions) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d", ...options });
}

export function verifyJwt<T = any>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: Request): string | null {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|; )token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function getUserFromRequest(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const decoded = verifyJwt<{ id: string; sid?: string }>(token);
  if (!decoded?.id) return null;
  await dbConnect();
  const user = await User.findById(decoded.id).populate("invitedBy", "name email other_channels").lean<any>();
  if (!user) return null;
  // Enforce single-device session: JWT sid must match user's current sessionId
  if ((user as any).sessionId && decoded.sid && (user as any).sessionId === decoded.sid) {
    return user;
  }
  return null;
}

export type RequireAuthOptions = {
  rolesAllowed?: Role[];
  minPlan?: Plan;
};

export async function requireAuth(
  req: Request,
  options: RequireAuthOptions = {}
) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return { ok: false, status: 401, error: "Unauthorized" as const };
  }

  const { rolesAllowed, minPlan } = options;

  if (rolesAllowed && rolesAllowed.length > 0) {
    const hasRole = (user.roles || []).some((r: Role) => rolesAllowed.includes(r));
    if (!hasRole) {
      return { ok: false, status: 403, error: "Forbidden: insufficient role" as const };
    }
  }

  if (minPlan) {
    const level = PLAN_LEVEL[minPlan];
    const current: Plan = user.subscription?.plan || "freemium";
    if (PLAN_LEVEL[current] < level) {
      return { ok: false, status: 402, error: "Payment Required: upgrade plan" as const };
    }
  }

  // Compute derived end date for subscription
  // let derivedEndDate: Date | null = null;
  // if (user.subscription) {
  //   const sub = user.subscription;

  //   if (sub.endDate) {
  //     derivedEndDate = new Date(sub.endDate);
  //   } else if (sub.startDate && sub.billingCycle) {
  //     const start = new Date(sub.startDate);
  //     const d = new Date(start);
  //     switch (sub.billingCycle) {
  //       case "weekly":
  //         d.setDate(d.getDate() + 7);
  //         break;
  //       case "monthly":
  //         d.setMonth(d.getMonth() + 1);
  //         break;
  //       case "quarterly":
  //         d.setMonth(d.getMonth() + 3);
  //         break;
  //       case "yearly":
  //         d.setFullYear(d.getFullYear() + 1);
  //         break;
  //     }
  //     derivedEndDate = d;
  //   }

  //   // Subscription status check
  //   if (sub.status !== "active") {
  //     return { ok: false, error: "Subscription inactive" };
  //   }

  //   // Expiry check using derivedEndDate
  //   if (derivedEndDate && derivedEndDate < new Date()) {
  //     return { ok: false, error: "Subscription expired" };
  //   }
  // }

  return { ok: true, user } as const;
}

export function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
