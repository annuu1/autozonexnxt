import { NextResponse } from "next/server";
import Symbol from "@/models/Symbols";
import dbConnect from "@/lib/mongodb";

export async function GET() {
    try {
        await dbConnect();

        const [sectors, watchlists] = await Promise.all([
            Symbol.distinct("sectors"),
            Symbol.distinct("watchlists")
        ]);

        return NextResponse.json({
            success: true,
            sectors: sectors.filter(Boolean).sort(),
            watchlists: watchlists.filter(Boolean).sort()
        });

    } catch (error: any) {
        console.error("Error fetching scanner filters:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
