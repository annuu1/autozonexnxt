import { NextResponse } from "next/server";
import Symbol from "@/models/Symbols";
import DemandZone from "@/models/DemandZone";
import dbConnect from "@/lib/mongodb";

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const isLiquid = searchParams.get("is_liquid");

        const skip = (page - 1) * limit;

        const matchStage: any = {};
        if (search) {
            matchStage.$or = [
                { symbol: { $regex: search, $options: "i" } },
                { company_name: { $regex: search, $options: "i" } },
            ];
        }

        if (isLiquid !== null && isLiquid !== undefined && isLiquid !== "") {
            matchStage.is_liquid = isLiquid === 'true';
        }

        const status = searchParams.get("status");
        if (status) {
            matchStage.status = status;
        }

        const total = await Symbol.countDocuments(matchStage);
        const symbols = await Symbol.find(matchStage)
            .sort({ symbol: 1 })
            .skip(skip)
            .limit(limit);

        return NextResponse.json({
            success: true,
            symbols,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        console.error("Error fetching symbols:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { symbol, company_name, sectors, watchlists, is_liquid, status } = body;

        if (!symbol) {
            return NextResponse.json({ success: false, error: "Symbol is required" }, { status: 400 });
        }

        const existing = await Symbol.findOne({ symbol });
        if (existing) {
            return NextResponse.json({ success: false, error: "Symbol already exists" }, { status: 400 });
        }

        const newSymbol = await Symbol.create({
            symbol,
            company_name,
            sectors: sectors || [],
            watchlists: watchlists || [],
            is_liquid: is_liquid || false,
            status: status || 'Active',
            _id: new (await import('mongoose')).Types.ObjectId(),
        });

        return NextResponse.json({ success: true, symbol: newSymbol });
    } catch (error: any) {
        console.error("Error creating symbol:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { _id, ...updateData } = body;

        if (!_id) {
            return NextResponse.json(
                { success: false, error: "Symbol ID is required" },
                { status: 400 }
            );
        }

        const updatedSymbol = await Symbol.findByIdAndUpdate(
            _id,
            { $set: updateData },
            { new: true }
        );

        // If setting is_liquid to false, delete associated demand zones
        if (updateData.is_liquid === false && updatedSymbol) {
            await DemandZone.deleteMany({ ticker: updatedSymbol.symbol });
        }

        if (!updatedSymbol) {
            return NextResponse.json(
                { success: false, error: "Symbol not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            symbol: updatedSymbol,
        });

    } catch (error: any) {
        console.error("Error updating symbol:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const idsParam = searchParams.get('ids');

        if (!idsParam) {
            return NextResponse.json({ success: false, error: "IDs required" }, { status: 400 });
        }

        const ids = idsParam.split(',');

        // 1. Find symbols to get tickers
        const symbolsToDelete = await Symbol.find({ _id: { $in: ids } });
        const tickers = symbolsToDelete.map(s => s.symbol);

        // 2. Delete Demand Zones
        if (tickers.length > 0) {
            await DemandZone.deleteMany({ ticker: { $in: tickers } });
        }

        // 3. Delete Symbols
        await Symbol.deleteMany({ _id: { $in: ids } });

        return NextResponse.json({ success: true, message: `Deleted ${ids.length} symbols and associated demand zones.` });

    } catch (error: any) {
        console.error("Error deleting symbols:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { ids, action, value } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ success: false, error: "IDs array required" }, { status: 400 });
        }

        let updateQuery: any = {};

        switch (action) {
            case 'update_status':
                updateQuery = { $set: { status: value } };
                break;
            case 'update_liquidity':
                updateQuery = { $set: { is_liquid: value } };
                break;
            case 'add_sector':
                updateQuery = { $addToSet: { sectors: value } };
                break;
            case 'remove_sector':
                updateQuery = { $pull: { sectors: value } };
                break;
            case 'add_watchlist':
                updateQuery = { $addToSet: { watchlists: value } };
                break;
            case 'remove_watchlist':
                updateQuery = { $pull: { watchlists: value } };
                break;
            default:
                return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
        }

        if (action === 'update_liquidity' && value === false) {
            const symbolsToUpdate = await Symbol.find({ _id: { $in: ids } });
            const tickers = symbolsToUpdate.map(s => s.symbol);
            if (tickers.length > 0) {
                await DemandZone.deleteMany({ ticker: { $in: tickers } });
            }
        }

        await Symbol.updateMany({ _id: { $in: ids } }, updateQuery);

        return NextResponse.json({ success: true, message: "Bulk update successful" });

    } catch (error: any) {
        console.error("Error bulk updating symbols:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
