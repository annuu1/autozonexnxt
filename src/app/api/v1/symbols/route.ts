import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SymbolModel from "@/models/Symbols";
import { requireAuth } from "@/lib/auth";

// GET symbols with optional search query
export async function GET(req: Request) {
  // Any signed-in user (freemium ok)
  const auth = await requireAuth(req, { rolesAllowed: ["user", "agent", "manager", "admin"], minPlan: "freemium" });
  if (!("ok" in auth) || !auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    let symbols;

    if (search) {
      // Case-insensitive search on the `name` or `symbol` field
      symbols = await SymbolModel.find({
        symbol: { $regex: search, $options: "i" },
      }).limit(20); // limit for performance
    } else {
      symbols = await SymbolModel.find({}).limit(50);
    }

    return NextResponse.json(symbols);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE symbol by ID
export async function PUT(req: Request) {
  // Only manager/admin and Starter+ can update symbols
  const auth = await requireAuth(req, { rolesAllowed: ["manager", "admin"], minPlan: "starter" });
  if (!("ok" in auth) || !auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await dbConnect();
    const { id, updates } = await req.json();

    if (!id || !updates) {
      return NextResponse.json(
        { error: "ID and updates required" },
        { status: 400 }
      );
    }

    const updatedSymbol = await SymbolModel.findByIdAndUpdate(id, updates, {
      new: true,
    });

    return NextResponse.json(updatedSymbol);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
