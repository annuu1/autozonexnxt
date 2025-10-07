import { NextResponse } from "next/server";
import TradeAnalysis from "@/models/TradeAnalysis";
import dbConnect from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";

// GET /api/trade-analysis
export async function GET(req: Request) {
  // Authenticate and authorize users with roles: user, agent, manager, admin
  const auth = await requireAuth(req, {
    rolesAllowed: ["user", "agent", "manager", "admin"],
  });
  if (!("ok" in auth) || !auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await dbConnect();
    const trades = await TradeAnalysis.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: trades });
  } catch (error: any) {
    console.error("Fetch trades error:", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trades" },
      { status: 500 }
    );
  }
}

// POST /api/trade-analysis
export async function POST(req: Request) {
  // Authenticate and authorize users with roles: manager, admin
  const auth = await requireAuth(req, {
    rolesAllowed: ["manager", "admin"],
  });
  if (!("ok" in auth) || !auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const { stock, analysis, status = "Analysis Only", images } = body;

    // Input validation
    if (!stock || typeof stock !== "string") {
      return NextResponse.json(
        { success: false, error: "Stock is required and must be a string" },
        { status: 400 }
      );
    }
    if (!analysis || typeof analysis !== "string") {
      return NextResponse.json(
        { success: false, error: "Analysis is required and must be a string" },
        { status: 400 }
      );
    }
    if (
      !status ||
      !["Analysis Only", "Entry Given", "Running", "Target Hit", "Stoploss Hit"].includes(status)
    ) {
      return NextResponse.json(
        { success: false, error: "Valid status is required" },
        { status: 400 }
      );
    }
    if (!images || (typeof images !== "string" && !Array.isArray(images))) {
      return NextResponse.json(
        { success: false, error: "Images must be a string or an array of strings" },
        { status: 400 }
      );
    }

    // Normalize images to an array
    const normalizedBody = {
      stock,
      analysis,
      status,
      images: Array.isArray(images) ? images : [images].filter(Boolean),
    };

    const newTrade = await TradeAnalysis.create(normalizedBody);
    return NextResponse.json({ success: true, data: newTrade }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}