// app/api/v1/dashboard/report/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DemandZone from "@/models/DemandZone";
import { requireAuth } from "@/lib/auth";

function formatApproaching(doc: any) {
  return {
    id: doc.zone_id,
    range: `${doc.distal_line.toFixed(2)}–${doc.proximal_line.toFixed(2)}`,
    time: doc.zone_alert_time
      ? new Date(doc.zone_alert_time).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null,
    strength: doc.trade_score >= 7 ? "Strong" : "Medium",
  };
}

function formatEntered(doc: any) {
  return {
    id: doc.zone_id,
    range: `${doc.distal_line.toFixed(2)}–${doc.proximal_line.toFixed(2)}`,
    time: doc.zone_entry_time
      ? new Date(doc.zone_entry_time).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null,
    holding: doc.zone_breach_time ? "No" : "Yes",
  };
}

function formatBreached(doc: any) {
  return {
    id: doc.zone_id,
    range: `${doc.distal_line.toFixed(2)}–${doc.proximal_line.toFixed(2)}`,
    time: doc.zone_breach_time
      ? new Date(doc.zone_breach_time).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null,
    reaction: "Failed", // placeholder — can refine later
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
  const selectedDate = dateParam ? new Date(dateParam) : new Date();
  selectedDate.setHours(0, 0, 0, 0);

  const tomorrow = new Date(selectedDate);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 🔹 Fetch today's zones (convert string → date)
  const todayZones = await DemandZone.find({
    $or: [
      {
        $expr: {
          $and: [
            {
              $gte: [
                { $dateFromString: { dateString: "$zone_alert_time" } },
                selectedDate,
              ],
            },
            {
              $lt: [
                { $dateFromString: { dateString: "$zone_alert_time" } },
                tomorrow,
              ],
            },
          ],
        },
      },
      {
        $expr: {
          $and: [
            {
              $gte: [
                { $dateFromString: { dateString: "$zone_entry_time" } },
                selectedDate,
              ],
            },
            {
              $lt: [
                { $dateFromString: { dateString: "$zone_entry_time" } },
                tomorrow,
              ],
            },
          ],
        },
      },
      {
        $expr: {
          $and: [
            {
              $gte: [
                { $dateFromString: { dateString: "$zone_breach_time" } },
                selectedDate,
              ],
            },
            {
              $lt: [
                { $dateFromString: { dateString: "$zone_breach_time" } },
                tomorrow,
              ],
            },
          ],
        },
      },
    ],
  }).lean();

  // 🔹 Categorize
  const todayData = {
    approaching: todayZones
      .filter((z) => z.zone_alert_time && !z.zone_entry_time)
      .map(formatApproaching),
    entered: todayZones
      .filter((z) => z.zone_entry_time && !z.zone_breach_time)
      .map(formatEntered),
    breached: todayZones.filter((z) => z.zone_breach_time).map(formatBreached),
  };

  // 🔹 Fetch history (before today)
  const pastZones = await DemandZone.find({
    $or: [
      {
        $expr: {
          $lt: [
            { $dateFromString: { dateString: "$zone_alert_time" } },
            selectedDate,
          ],
        },
      },
      {
        $expr: {
          $lt: [
            { $dateFromString: { dateString: "$zone_entry_time" } },
            selectedDate,
          ],
        },
      },
      {
        $expr: {
          $lt: [
            { $dateFromString: { dateString: "$zone_breach_time" } },
            selectedDate,
          ],
        },
      },
    ],
  }).lean();

  // 🔹 Group daywise
  const daywiseData: Record<string, any> = {};
  for (const doc of pastZones) {
    const rawTime =
      doc.zone_breach_time || doc.zone_entry_time || doc.zone_alert_time;

    if (!rawTime) continue;

    const dateKey = new Date(rawTime).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    if (!daywiseData[dateKey]) {
      daywiseData[dateKey] = { approaching: [], entered: [], breached: [] };
    }

    if (doc.zone_alert_time && !doc.zone_entry_time) {
      daywiseData[dateKey].approaching.push(formatApproaching(doc));
    } else if (doc.zone_entry_time && !doc.zone_breach_time) {
      daywiseData[dateKey].entered.push(formatEntered(doc));
    } else if (doc.zone_breach_time) {
      daywiseData[dateKey].breached.push(formatBreached(doc));
    }
  }

  return NextResponse.json({ today: todayData, history: daywiseData });
}
