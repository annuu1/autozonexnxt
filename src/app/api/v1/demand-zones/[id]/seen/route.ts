import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DemandZone from "@/models/DemandZone";
import { Types } from "mongoose";
import { requireAuth } from "@/lib/auth";

export async function POST(
    req: NextRequest,
    context: { params: { id: string } }
  ) {
    // Agents and above; Starter+
    const auth = await requireAuth(req, { rolesAllowed: ["agent", "manager", "admin"], minPlan: "starter" });
    if (!("ok" in auth) || !auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await dbConnect();
  
    const { id } = await context.params;

  // validate objectId
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const now = new Date();

    const zone = await DemandZone.findByIdAndUpdate(
      id,
      { $set: { last_seen: now } },
      { new: true } // return updated doc
    );

    if (!zone) {
      return NextResponse.json({ error: "Demand zone not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Last seen updated",
      data: {
        id: zone._id,
        ticker: zone.ticker,
        last_seen: zone.last_seen,
      },
    });
  } catch (err: any) {
    console.error("Error updating last seen:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
