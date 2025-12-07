import { NextResponse } from "next/server";
import DemandZone from "@/models/DemandZone";
import dbConnect from "@/lib/mongodb";

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const ticker = searchParams.get("ticker");

        if (!ticker) {
            return NextResponse.json({ success: false, error: "Ticker is required" }, { status: 400 });
        }

        const zones = await DemandZone.find({ ticker }).sort({ timestamp: -1 });

        return NextResponse.json({
            success: true,
            zones,
        });
    } catch (error: any) {
        console.error("Error fetching demand zones:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
