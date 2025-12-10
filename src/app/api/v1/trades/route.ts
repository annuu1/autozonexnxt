import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Trades from "@/models/Trade";
import { requireAuth } from "@/lib/auth";

// Helper to sanitize query params
function getQueryParam(url: string, key: string) {
  const { searchParams } = new URL(url);
  return searchParams.get(key);
}

// ✅ GET: Fetch User's Journal/Trades
import Symbol from "@/models/Symbols";

export async function GET(req: Request) {
  const auth = await requireAuth(req, { rolesAllowed: ["user", "agent", "manager", "admin", "associate"] });
  if (!auth.ok || !auth.user) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: auth.status ?? 401 });
  }

  await dbConnect();

  const page = parseInt(getQueryParam(req.url, "page") || "1");
  const limit = parseInt(getQueryParam(req.url, "limit") || "20"); // Higher default for journal
  const symbol = getQueryParam(req.url, "symbol");
  const status = getQueryParam(req.url, "status");
  const startDate = getQueryParam(req.url, "startDate");
  const endDate = getQueryParam(req.url, "endDate");
  const tags = getQueryParam(req.url, "tags"); // Comma separated

  const query: any = { userId: auth.user._id };

  if (symbol) query.symbol = { $regex: symbol, $options: "i" };
  if (status) query.status = status;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  if (tags) {
    query.tags = { $in: tags.split(",") };
  }

  const skip = (page - 1) * limit;

  try {
    const trades = await Trades.find(query)
      .sort({ date: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean for performance and modification

    const total = await Trades.countDocuments(query);

    // Enrich with Live Data for Open Trades
    const openTrades = trades.filter((t: any) => t.status === "Open");
    if (openTrades.length > 0) {
      const symbols = [...new Set(openTrades.map((t: any) => t.symbol))];
      const marketData = await Symbol.find({ symbol: { $in: symbols } }).select("symbol ltp");
      const marketMap = new Map(marketData.map((s: any) => [s.symbol, s.ltp]));

      trades.forEach((trade: any) => {
        if (trade.status === "Open" && marketMap.has(trade.symbol)) {
          const ltp = marketMap.get(trade.symbol);
          trade.current_ltp = ltp;

          // Suggest Status
          if (trade.position_type === "Long") {
            if (ltp <= trade.stop_loss) trade.suggested_status = "SL Hit";
            else if (ltp >= trade.target_price) trade.suggested_status = "Target Hit";
          } else if (trade.position_type === "Short") {
            if (ltp >= trade.stop_loss) trade.suggested_status = "SL Hit";
            else if (ltp <= trade.target_price) trade.suggested_status = "Target Hit";
          }
        }
      });
    }

    return NextResponse.json({
      data: trades,
      debugQuery: query,
      debugUser: auth.user,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ POST: Create New Journal Entry
export async function POST(req: Request) {
  const auth = await requireAuth(req, { rolesAllowed: ["user", "agent", "manager", "admin", "associate"] });
  if (!auth.ok || !auth.user) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: auth.status ?? 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();

    // Basic Validation
    const requiredFields = ["symbol", "position_type", "quantity", "entry_price"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const tradeData = {
      ...body,
      userId: auth.user._id, // Enforce User Ownership
      date: body.date ? new Date(body.date) : new Date(),
    };

    const newTrade = await Trades.create(tradeData);
    return NextResponse.json(newTrade, { status: 201 });
  } catch (err: any) {
    console.error("Error creating trade:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ PUT: Update Entry (Post-trade review, etc.)
export async function PUT(req: Request) {
  const auth = await requireAuth(req, { rolesAllowed: ["user", "agent", "manager", "admin", "associate"] });
  if (!auth.ok || !auth.user) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: auth.status ?? 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const { _id, ...updates } = body;

    if (!_id) return NextResponse.json({ error: "Trade ID required" }, { status: 400 });

    // Ensure user owns the trade
    const trade = await Trades.findOne({ _id, userId: auth.user._id });
    if (!trade) {
      return NextResponse.json({ error: "Trade not found or access denied" }, { status: 404 });
    }

    const updatedTrade = await Trades.findByIdAndUpdate(_id, updates, { new: true });
    return NextResponse.json(updatedTrade);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ DELETE: Remove Entry
export async function DELETE(req: Request) {
  const auth = await requireAuth(req, { rolesAllowed: ["user", "agent", "manager", "admin", "associate"] });
  if (!auth.ok || !auth.user) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: auth.status ?? 401 });
  }

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Trade ID required" }, { status: 400 });

    const deleted = await Trades.findOneAndDelete({ _id: id, userId: auth.user._id });
    if (!deleted) {
      return NextResponse.json({ error: "Trade not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
