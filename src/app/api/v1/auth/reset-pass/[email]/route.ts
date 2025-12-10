import { requireAuth } from "@/lib/auth";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request, { params }: { params: { email: string } }) {
  const { email } = await params;
  const auth = await requireAuth(req, { rolesAllowed: ["admin"] });
  if (!auth.ok) return NextResponse.json(auth, { status: auth.status });

  await dbConnect();

  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const tempPassword = user?.tempPassword || "Temp123";

  await User.findByIdAndUpdate(user._id, {
    passwordHash: await bcrypt.hash(tempPassword, 10),
  });

  return NextResponse.json({ ok: true });
}
