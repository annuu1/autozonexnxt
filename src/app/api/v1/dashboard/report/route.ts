// app/api/v1/dashboard/report/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DemandZone from "@/models/DemandZone";
import { requireAuth } from "@/lib/auth";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

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
          hour12: true,
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
          hour12: true,
        })
      : null,
    reaction: "Failed",
  };
}

export async function GET(req: Request) {
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
  const historyLimit = parseInt(url.searchParams.get("limit") || "7");

  const selectedDate = dateParam ? new Date(dateParam) : new Date();
  selectedDate.setHours(0, 0, 0, 0);

  const tomorrow = new Date(selectedDate);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const startIso = selectedDate.toISOString();
  const endIso = tomorrow.toISOString();

  // Determine if selected date is today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = selectedDate.getTime() === today.getTime();

  // Cache key for today's data (includes date)
  const todayCacheKey = `report-today-${selectedDate.toISOString().split("T")[0]}`;

  let todayData;

  // Check cache for today's data
  const cachedToday = await redis.get(todayCacheKey);
  if (cachedToday) {
    todayData = cachedToday;
  } else {
    // Fetch today's zones
    const todayZones = await DemandZone.find({
      $or: [
        { zone_alert_time: { $gte: startIso, $lt: endIso } },
        { zone_entry_time: { $gte: startIso, $lt: endIso } },
        { zone_breach_time: { $gte: startIso, $lt: endIso } },
      ],
    }).lean();

    todayData = {
      approaching: todayZones
        .filter((z) => z.zone_alert_time && !z.zone_entry_time)
        .map(formatApproaching),
      entered: todayZones
        .filter((z) => z.zone_entry_time && !z.zone_breach_time)
        .map(formatEntered),
      breached: todayZones.filter((z) => z.zone_breach_time).map(formatBreached),
    };

    // Cache with different TTL based on whether it's today or historical
    const ttl = isToday ? 3600 : 604800; // 1 hour for today, 1 week for past dates
    await redis.set(todayCacheKey, todayData, { ex: ttl });
  }

  // Historical data (only fetch if requested)
  let historyData = {};
  let totalHistoryDays = 0;

  if (includeHistory) {
    // Cache key for history metadata (list of dates and their counts)
    const historyMetaCacheKey = `report-history-meta-${selectedDate.toISOString().split("T")[0]}`;

    let sortedDates: string[];
    let daywiseMap: Record<string, any>;

    // Check if we have cached metadata
    const cachedMeta = await redis.get(historyMetaCacheKey);
    
    if (cachedMeta) {
      const meta = cachedMeta as { dates: string[] };
      sortedDates = meta.dates;
      totalHistoryDays = sortedDates.length;
      
      // Fetch individual date data from cache
      daywiseMap = {};
      const startIdx = (historyPage - 1) * historyLimit;
      const endIdx = startIdx + historyLimit;
      const paginatedDates = sortedDates.slice(startIdx, endIdx);

      // Fetch each date's data from cache (or DB if not cached)
      for (const dateKey of paginatedDates) {
        const dateCacheKey = `report-date-${dateKey}`;
        const cachedDate = await redis.get(dateCacheKey);
        
        if (cachedDate) {
          daywiseMap[dateKey] = cachedDate;
        }
      }

      // If any dates missing from cache, we need to refetch
      if (Object.keys(daywiseMap).length !== paginatedDates.length) {
        // Reset to trigger full fetch below
        sortedDates = [];
      }
    }

    // If no cache or incomplete, fetch from DB
    if (!cachedMeta || sortedDates.length === 0) {
      const pastZones = await DemandZone.find({
        $or: [
          { zone_alert_time: { $lt: startIso } },
          { zone_entry_time: { $lt: startIso } },
          { zone_breach_time: { $lt: startIso } },
        ],
      }).lean();

      // Group by date
      daywiseMap = {};
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
      sortedDates = Object.keys(daywiseMap).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
      );

      totalHistoryDays = sortedDates.length;

      // Cache metadata (1 week)
      await redis.set(
        historyMetaCacheKey,
        { dates: sortedDates },
        { ex: 604800 }
      );

      // Cache each individual date's data (1 week)
      for (const dateKey of sortedDates) {
        const dateCacheKey = `report-date-${dateKey}`;
        await redis.set(dateCacheKey, daywiseMap[dateKey], { ex: 604800 });
      }
    } else {
      totalHistoryDays = sortedDates.length;
    }

    // Build paginated history
    const startIdx = (historyPage - 1) * historyLimit;
    const endIdx = startIdx + historyLimit;
    const paginatedDates = sortedDates.slice(startIdx, endIdx);

    const sortedDaywiseData: Record<string, any> = {};
    paginatedDates.forEach((key) => {
      if (daywiseMap[key]) {
        sortedDaywiseData[key] = daywiseMap[key];
      }
    });

    historyData = sortedDaywiseData;
  }

  return NextResponse.json(
    {
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
    },
    {
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    }
  );
}