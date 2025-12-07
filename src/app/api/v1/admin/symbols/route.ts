import { NextResponse } from "next/server";
import Symbol from "@/models/Symbols";
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
