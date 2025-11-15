import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DemandZone from "@/models/DemandZone";
import { requireAuth } from "@/lib/auth";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const auth = await requireAuth(req, {
    rolesAllowed: ["manager", "admin"], // only managers & admins
  });
  if (!("ok" in auth) || !auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  await dbConnect();

  try {
    const updated = await DemandZone.findOneAndUpdate(
      { zone_id: id },
      { $set: { freshness: 0, trade_score: 0 } },
      { new: true }
    );    

    if (!updated) {
      return NextResponse.json({ error: "Zone not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Zone freshness reset successfully" });
  } catch (err: any) {
    console.error("Reset zone freshness error:", err);
    return NextResponse.json(
      { error: "Failed to reset zone freshness" },
      { status: 500 }
    );
  }
}
