import { NextResponse } from "next/server";
import Symbol from "@/models/Symbols";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
        }

        const text = await file.text();
        const lines = text.split(/\r?\n/);
        const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

        const symbolsToUpsert = [];

        // Basic CSV parsing (assuming no commas in values for simplicity, or handle quotes later if needed)
        // A better approach for robust parsing would be needed for complex CSVs
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = line.split(",");
            const row: any = {};

            headers.forEach((header, index) => {
                row[header] = values[index]?.trim();
            });

            if (row.symbol) {
                symbolsToUpsert.push(row);
            }
        }

        let updatedCount = 0;
        let createdCount = 0;

        for (const row of symbolsToUpsert) {
            const filter = { symbol: row.symbol };
            const update: any = {
                company_name: row.company_name,
                status: row.status || 'Active',
            };

            if (row.is_liquid) {
                update.is_liquid = row.is_liquid.toLowerCase() === 'true';
            }

            if (row.sectors) {
                update.sectors = row.sectors.split('|').map((s: string) => s.trim()); // Assume pipe separated for arrays in CSV
            }

            if (row.watchlists) {
                update.watchlists = row.watchlists.split('|').map((s: string) => s.trim());
            }

            // Check if exists to determine if we need to set _id (for new docs)
            const existing = await Symbol.findOne(filter);
            if (existing) {
                await Symbol.updateOne(filter, { $set: update });
                updatedCount++;
            } else {
                update.symbol = row.symbol;
                update._id = new mongoose.Types.ObjectId();
                await Symbol.create(update);
                createdCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${symbolsToUpsert.length} symbols. Created: ${createdCount}, Updated: ${updatedCount}`,
        });

    } catch (error: any) {
        console.error("Error uploading symbols:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
