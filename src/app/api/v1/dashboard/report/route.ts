// app/api/v1/dashboard/report/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DemandZone from "@/models/DemandZone";
import { requireAuth } from "@/lib/auth";

function formatApproaching(doc: any) {
  return {
    _id: doc._id,
    zone_id: doc.zone_id,
    range: `${doc.distal_line.toFixed(2)}–${doc.proximal_line.toFixed(2)}`,
    time: doc.zone_alert_time
      ? new Date(doc.zone_alert_time).toLocaleTimeString("en-IN", {
          timeZone: "UTC",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : null,
    strength: doc.trade_score >= 7 ? "Strong" : "Medium",
  };
}

function formatEntered(doc: any) {
  return {
    _id: doc._id,
    zone_id: doc.zone_id,
    range: `${doc.distal_line.toFixed(2)}–${doc.proximal_line.toFixed(2)}`,
    time: doc.zone_entry_time
      ? new Date(doc.zone_entry_time).toLocaleTimeString("en-IN", {
          timeZone: "UTC",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        })
      : null,
    holding: doc.zone_breach_time ? "No" : "Yes",
  };
}

function formatBreached(doc: any) {
  return {
    _id: doc._id,
    zone_id: doc.zone_id,
    range: `${doc.distal_line.toFixed(2)}–${doc.proximal_line.toFixed(2)}`,
    time: doc.zone_breach_time
      ? new Date(doc.zone_breach_time).toLocaleTimeString("en-IN", {
          timeZone: "UTC",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        })
      : null,
    reaction: "Failed",
  };
}

export async function GET(req: Request) {
  // 🔹 Require authentication
  const auth = await requireAuth(req, {
    rolesAllowed: ["user", "agent", "manager", "admin"],
  });
  if (!("ok" in auth) || !auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  await dbConnect();

  const url = new URL(req.url);
  const dateParam = url.searchParams.get("date");
  const includeHistory = url.searchParams.get("includeHistory") === "true";
  const historyPage = parseInt(url.searchParams.get("page") || "1");
  const historyLimit = parseInt(url.searchParams.get("limit") || "7"); // 7 days per load
  
  const selectedDate = dateParam ? new Date(dateParam) : new Date();
  selectedDate.setHours(0, 0, 0, 0);

  const tomorrow = new Date(selectedDate);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const startIso = selectedDate.toISOString();
  const endIso = tomorrow.toISOString();

  // 🔹 Today's zones (always fetch)
  const todayZones = await DemandZone.find({
    $or: [
      { zone_alert_time: { $gte: startIso, $lt: endIso } },
      { zone_entry_time: { $gte: startIso, $lt: endIso } },
      { zone_breach_time: { $gte: startIso, $lt: endIso } },
    ],
  }).lean();

  const todayData = {
    approaching: todayZones
      .filter((z) => z.zone_alert_time && !z.zone_entry_time)
      .map(formatApproaching),
    entered: todayZones
      .filter((z) => z.zone_entry_time && !z.zone_breach_time)
      .map(formatEntered),
    breached: todayZones.filter((z) => z.zone_breach_time).map(formatBreached),
  };

  // 🔹 Historical data (only fetch if requested)
  let historyData = {};
  let totalHistoryDays = 0;

  if (includeHistory) {
    const pastZones = await DemandZone.find({
      $or: [
        { zone_alert_time: { $lt: startIso } },
        { zone_entry_time: { $lt: startIso } },
        { zone_breach_time: { $lt: startIso } },
      ],
    }).lean();

    // Group by date
    const daywiseMap: Record<string, any> = {};
    for (const doc of pastZones) {
      const rawTime =
        doc.zone_breach_time || doc.zone_entry_time || doc.zone_alert_time;
      if (!rawTime) continue;

      const dateKey = new Date(rawTime).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });

      if (!daywiseMap[dateKey]) {
        daywiseMap[dateKey] = { approaching: [], entered: [], breached: [] };
      }

      if (doc.zone_alert_time && !doc.zone_entry_time) {
        daywiseMap[dateKey].approaching.push(formatApproaching(doc));
      } else if (doc.zone_entry_time && !doc.zone_breach_time) {
        daywiseMap[dateKey].entered.push(formatEntered(doc));
      } else if (doc.zone_breach_time) {
        daywiseMap[dateKey].breached.push(formatBreached(doc));
      }
    }

    // Sort dates (newest first)
    const sortedDates = Object.keys(daywiseMap).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    totalHistoryDays = sortedDates.length;

    // Apply pagination
    const startIdx = (historyPage - 1) * historyLimit;
    const endIdx = startIdx + historyLimit;
    const paginatedDates = sortedDates.slice(startIdx, endIdx);

    // Build paginated history
    const sortedDaywiseData: Record<string, any> = {};
    paginatedDates.forEach((key) => {
      sortedDaywiseData[key] = daywiseMap[key];
    });

    historyData = sortedDaywiseData;
  }

  return NextResponse.json({
    today: todayData,
    history: historyData,
    pagination: includeHistory
      ? {
          currentPage: historyPage,
          totalDays: totalHistoryDays,
          daysPerPage: historyLimit,
          totalPages: Math.ceil(totalHistoryDays / historyLimit),
        }
      : null,
  });
}