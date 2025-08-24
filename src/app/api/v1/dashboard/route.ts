import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import DemandZone from "@/models/DemandZone";
import Symbols from "@/models/Symbols";

export async function GET(req: Request) {
  await dbConnect();

  const url = new URL(req.url);
  const dateParam = url.searchParams.get("date");

  // Reference date = today if not passed
  const selectedDate = dateParam ? new Date(dateParam) : new Date();
  selectedDate.setHours(0, 0, 0, 0);

  // Base counts
  const users = await User.countDocuments();
  const demandZones = await DemandZone.countDocuments();
  const symbols = await Symbols.countDocuments();

  // Invalid = ltp null, NaN, missing, or string
  const invalidSymbols = await Symbols.countDocuments({
    $or: [
      { ltp: null },
      { ltp: { $exists: false } },
      { ltp: { $type: "string" } }
    ]
  });

  // Outdated = last_updated < selectedDate
  const outdatedSymbols = await Symbols.countDocuments({
    last_updated: { $lt: selectedDate }
  });

  return NextResponse.json({
    users,
    demandZones,
    symbols,
    invalidSymbols,
    outdatedSymbols
  });
}
