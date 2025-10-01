import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DemandZone from "@/models/DemandZone";
import { requireAuth } from "@/lib/auth";
import moment from "moment-timezone";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

export async function GET(req: Request) {
  // 1️⃣ Authentication
  const auth = await requireAuth(req, {
    rolesAllowed: ["user", "agent", "manager", "admin"],
  });
  if (!("ok" in auth) || !auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // 2️⃣ Connect to MongoDB
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const timeframe = (searchParams.get("timeframe") as "1wk" | "1mo" | "3mo") || "1wk";

    // 🔑 Cache key (based on timeframe)
    const cacheKey = `latest-zone-${req.url}`;

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=60",
          "Vary": "Accept-Encoding, Query-String",
        },
      });
    }

    // 3️⃣ Current time in IST
    const now = moment().tz("Asia/Kolkata");

    // 4️⃣ Determine the period unit based on timeframe
    let periodUnit: "isoWeek" | "month" | "quarter";
    switch (timeframe) {
      case "1wk":
        periodUnit = "isoWeek";
        break;
      case "1mo":
        periodUnit = "month";
        break;
      case "3mo":
        periodUnit = "quarter";
        break;
      default:
        periodUnit = "isoWeek";
    }

    // 5️⃣ Check if the current period is complete
    const endOfPeriod = now.clone().endOf(periodUnit);
    const isLastDay =
      now.date() === endOfPeriod.date() &&
      now.month() === endOfPeriod.month() &&
      now.year() === endOfPeriod.year();
    const isComplete = isLastDay && now.hour() >= 16;

    // 6️⃣ Decide target start
    let targetStart: moment.Moment;
    if (isComplete) {
      targetStart = now.clone().startOf(periodUnit);
    } else {
      targetStart = now.clone().subtract(1, periodUnit === "isoWeek" ? "week" : periodUnit).startOf(periodUnit);
    }

    // 7️⃣ Convert target start to JS Date
    const targetDate = targetStart.clone().startOf("day").toDate();
    console.log(`Target Start (${timeframe}, UTC Date):`, targetDate);

    // 8️⃣ Query: filter by timeframe[0] and end_timestamp >= targetDate
    const zones = await DemandZone.find({
      "timeframes.0": timeframe,
      $expr: {
        $gte: [
          { $dateFromString: { dateString: "$end_timestamp" } },
          targetDate,
        ],
      },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Save result in Redis with 1-hour TTL
    await redis.set(cacheKey, zones, { ex: 3600 });

    return NextResponse.json(zones, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=60",
        "Vary": "Accept-Encoding, Query-String",
      },
    });
  } catch (err: any) {
    console.error("Fetch latest zones error:", err);
    return NextResponse.json(
      { error: "Failed to fetch latest zones" },
      { status: 500 }
    );
  }
}