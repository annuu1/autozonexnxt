import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DemandZone from "@/models/DemandZone";
import { requireAuth } from "@/lib/auth";

type Params = { params: { id: string } };

// ✅ DELETE /api/v1/dashboard/zone/:id
export async function DELETE(req: Request, { params }: Params) {
  const auth = await requireAuth(req, {
    rolesAllowed: ["manager", "admin"], // only managers & admins
  });
  if (!("ok" in auth) || !auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  await dbConnect();

  try {
    const deleted = await DemandZone.findOneAndDelete({ zone_id: params.id });

    if (!deleted) {
      return NextResponse.json(
        { error: "Zone not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Zone deleted successfully" });
  } catch (err: any) {
    console.error("Delete zone error:", err);
    return NextResponse.json(
      { error: "Failed to delete zone" },
      { status: 500 }
    );
  }
}
