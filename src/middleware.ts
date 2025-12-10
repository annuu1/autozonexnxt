// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";
import { verifyJwt } from "@/lib/auth-edge";

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  // decode JWT to extract userId
  let userId = "guest";
  if (token) {
    const decoded = await verifyJwt<{ id: string }>(token); // <- await here
    if (decoded?.id) {
      userId = decoded.id;
    }
  }

  // Collect request details
  const logPayload = {
    userId: userId,
    action: "ACCESS_PAGE",
    endpoint: pathname,
    method: req.method,
    ip: (req as any).ip ?? req.headers.get("x-forwarded-for") ?? "unknown",
    userAgent: req.headers.get("user-agent") ?? "unknown",
  };

  // Send log asynchronously (don't block the request)
  event.waitUntil(
    fetch(`${req.nextUrl.origin}/api/v1/activity-logs`, {
      method: "POST",
      body: JSON.stringify(logPayload),
      headers: { "Content-Type": "application/json" },
    }).catch((err) => console.error("Failed to log activity:", err))
  );


  // Protect dashboard pages
  if (pathname.startsWith("/v1/dashboard")) {
    // const token = req.cookies.get("token")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/v1/login"; // or "/login" if you add a login page
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/v1/dashboard/:path*"],
};
