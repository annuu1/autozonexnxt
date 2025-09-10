import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Trades from "@/models/Trade";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request) {
    // Any signed-in user can view trades
    const auth = await requireAuth(req, { rolesAllowed: ["user", "agent", "manager", "admin"], minPlan: "freemium" });
    if (!("ok" in auth) || !auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const trades = await Trades.find({}).skip(skip).limit(limit);

    // Get total count
    const total = await Trades.countDocuments();

    return NextResponse.json({
      data: trades,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
}

// ✅ POST a new trade
export async function POST(req: Request) {
  // Agents and above; Starter+
  const auth = await requireAuth(req, { rolesAllowed: ["agent", "manager", "admin"], minPlan: "starter" });
  if (!("ok" in auth) || !auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await dbConnect();
    const body = await req.json();

    console.log(body.symbol)

    // Validate required fields (you can add stricter validation later)
    if (!body.symbol || !body.quantity || !body.entry_price || !body.stop_loss || !body.target_price) {
      return NextResponse.json(
        { error: "Missing required fields: symbol, quantity, entry_price, stop_loss, target_price" },
        { status: 400 }
      );
    }
      
    const { rr, ...tradeData } = body;

    const newTrade = await Trades.create(tradeData);

    return NextResponse.json(newTrade, { status: 201 });
  } catch (err: any) {
    console.error("Error creating trade:", err);
    return NextResponse.json(
      { error: "Failed to create trade" },
      { status: 500 }
    );
  }
}

// ✅ PUT update a trade
export async function PUT(req: Request) {
  // Agents and above; Starter+
  const auth = await requireAuth(req, { rolesAllowed: ["agent", "manager", "admin"], minPlan: "starter" });
  if (!("ok" in auth) || !auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const updated = await Trades.findByIdAndUpdate(body._id, body, { new: true });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ DELETE a trade
export async function DELETE(req: Request) {
  // Managers and above; Starter+
  const auth = await requireAuth(req, { rolesAllowed: ["manager", "admin"], minPlan: "starter" });
  if (!("ok" in auth) || !auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const deleted = await Trades.findByIdAndDelete(body._id);
    return NextResponse.json(deleted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
