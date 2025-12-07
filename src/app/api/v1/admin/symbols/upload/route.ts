import { NextResponse } from "next/server";
import Symbol from "@/models/Symbols";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const targetSector = formData.get("targetSector") as string;
        const targetWatchlist = formData.get("targetWatchlist") as string;

        if (!file) {
            return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
        }

        const text = await file.text();
        const lines = text.split(/\r?\n/);
        const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

        const symbolsToUpsert = [];

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

            // Prepare data for creation
            const createData: any = {
                symbol: row.symbol,
                company_name: row.company_name || row.symbol,
                status: row.status || 'Active',
                is_liquid: row.is_liquid ? row.is_liquid.toLowerCase() === 'true' : false,
                sectors: [],
                watchlists: []
            };

            // Prepare data for update (using $addToSet for arrays)
            const updateData: any = {
                $set: {},
                $addToSet: {}
            };

            if (row.company_name) updateData.$set.company_name = row.company_name;
            if (row.status) updateData.$set.status = row.status;
            if (row.is_liquid) updateData.$set.is_liquid = row.is_liquid.toLowerCase() === 'true';

            // Handle CSV columns for sectors/watchlists
            const csvSectors = row.sectors ? row.sectors.split('|').map((s: string) => s.trim()) : [];
            const csvWatchlists = row.watchlists ? row.watchlists.split('|').map((s: string) => s.trim()) : [];

            // Handle Global Targets
            if (targetSector) csvSectors.push(targetSector);
            if (targetWatchlist) csvWatchlists.push(targetWatchlist);

            // Deduplicate
            const uniqueSectors = Array.from(new Set(csvSectors));
            const uniqueWatchlists = Array.from(new Set(csvWatchlists));

            // For Creation
            createData.sectors = uniqueSectors;
            createData.watchlists = uniqueWatchlists;

            // For Update
            if (uniqueSectors.length > 0) {
                updateData.$addToSet.sectors = { $each: uniqueSectors };
            }
            if (uniqueWatchlists.length > 0) {
                updateData.$addToSet.watchlists = { $each: uniqueWatchlists };
            }

            // Clean up empty update operators
            if (Object.keys(updateData.$set).length === 0) delete updateData.$set;
            if (Object.keys(updateData.$addToSet).length === 0) delete updateData.$addToSet;

            const existing = await Symbol.findOne(filter);
            if (existing) {
                if (Object.keys(updateData).length > 0) {
                    await Symbol.updateOne(filter, updateData);
                    updatedCount++;
                }
            } else {
                createData._id = new mongoose.Types.ObjectId();
                await Symbol.create(createData);
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
