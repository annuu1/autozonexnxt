import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import Config from "@/models/Config";

export async function GET(req: Request) {
  const auth = await requireAuth(req, { rolesAllowed: ["admin"] });
  if (!auth.ok) return NextResponse.json(auth, { status: auth.status });

  await dbConnect();

  const configs = await Config.find({}).lean();

  return NextResponse.json({ configs });
}

export async function POST(req: Request) {
  const auth = await requireAuth(req, { rolesAllowed: ["admin"] });
  if (!auth.ok) return NextResponse.json(auth, { status: auth.status });

  await dbConnect();

  const { key, value } = await req.json();

  if (!key) {
    return NextResponse.json({ error: "Key is required" }, { status: 400 });
  }

  const updated = await Config.findOneAndUpdate(
    { key },
    { value },
    { upsert: true, new: true }
  );

  return NextResponse.json({ ok: true, config: updated });
}

export async function DELETE(req: Request) {
  const auth = await requireAuth(req, { rolesAllowed: ["admin"] });
  if (!auth.ok) return NextResponse.json(auth, { status: auth.status });

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Key is required" }, { status: 400 });
  }

  await Config.findOneAndDelete({ key });

  return NextResponse.json({ ok: true });
}
