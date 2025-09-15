"use client";

import React, { useEffect, useState } from "react";
import { Card, Typography, Spin, Alert, Divider, Tabs, Tag } from "antd";
import { useReports } from "@/hooks/useReports";
import Reactions from "@/components/ui/Reactions";

const { Title } = Typography;

// ✅ Parse zone_id into symbol, timeframe, date
function parseZoneId(zone_id: string) {
  if (!zone_id) return { symbol: "Unknown", timeframe: "Unknown", date: "Unknown" };

  // Regex to match: SYMBOL-TIMEFRAME-YYYY-MM-DDTHH:mm:ss+TZ
  const match = zone_id.match(/^(.+?)-([^-]+)-(\d{4}-\d{2}-\d{2})/);

  if (!match) {
    console.warn("Could not parse zone_id:", zone_id);
    return { symbol: "Unknown", timeframe: "Unknown", date: "Unknown" };
  }

  const [, symbol, timeframe, rawDate] = match;

  // ✅ Format date nicely
  const dateObj = new Date(rawDate);
  const formattedDate = dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return { symbol, timeframe, date: formattedDate };
}

function ZoneCard({
  zone,
  allItemIds,
  showReactions = false,
}: {
  zone: any;
  allItemIds: string[];
  showReactions?: boolean;
}) {
  const { symbol, timeframe, date } = parseZoneId(zone.zone_id);

  function parseUtcTimeToLocal(zone:any) {
    // Extract the date part from zone_id (e.g., "2025-05-12")
    const isoDateMatch = zone.zone_id.match(/\d{4}-\d{2}-\d{2}/);
    const datePart = isoDateMatch ? isoDateMatch[0] : null;
  
    if (!datePart || !zone.time) return zone.time; // fallback
  
    // Combine date and time, assume UTC
    // Format time to 24-hour for Date parse, helper:
    const time24h = (() => {
      const [time, modifier] = zone.time.toLowerCase().split(' ');
      let [hours, minutes] = time.split(':').map(Number);
  
      if (modifier === 'pm' && hours < 12) hours += 12;
      if (modifier === 'am' && hours === 12) hours = 0;
  
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    })();
  
    // Construct full UTC datetime string
    const utcDateTimeStr = `${datePart}T${time24h}Z`; // Z means UTC
  
    const dateObj = new Date(utcDateTimeStr);
  
    // Convert to user's local time string (12hr format)
    return dateObj.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
  

  return (
    <div
      key={zone._id}
      className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition"
      style={{
        transition: "transform 0.15s ease-in-out, box-shadow 0.15s",
        minWidth: 250,
        maxWidth: 350,
        margin: "0 auto",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <strong style={{ fontSize: 16 }}>{symbol}</strong>
        <span style={{ fontSize: 12, color: "#555" }}>{parseUtcTimeToLocal(zone)}</span>
      </div>

      {/* Timeframe + Date */}
      <div className="mt-2 text-sm text-gray-600">
        <Tag color={timeframe === "1wk" ? "green" : timeframe === "1mo" ? "blue" : "orange"}>
          {timeframe}
        </Tag>
        <Tag>{date}</Tag>
      </div>

      {/* Range */}
      <div className="mt-1 text-sm text-gray-700">
        Range: <strong>{zone.range}</strong>
      </div>

      {/* Conditional Reactions */}
      {showReactions && (
        <div className="mt-3">
          <Reactions
            itemId={zone._id} // ✅ use real doc id
            type="zone"
            allItemIds={allItemIds}
            teamPickEnabled
          />
        </div>
      )}
    </div>
  );
}

function ZoneSection({
  title,
  data,
  showReactions = false,
}: {
  title: string;
  data: any[];
  showReactions?: boolean;
}) {
  if (!data || data.length === 0) return null;
  const allIds = data.map((z) => z._id); // ✅ use _id for allItemIds

  return (
    <>
      <Divider orientation="left" style={{ fontSize: 14, margin: "12px 0" }}>
        {title}
      </Divider>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((zone) => (
          <ZoneCard key={zone._id} zone={zone} allItemIds={allIds} showReactions={showReactions} />
        ))}
      </div>
    </>
  );
}

function ReportsPage() {
  const { data, isLoading, error } = useReports();
  const [showHistoryReactions, setShowHistoryReactions] = useState(false);

  // Lazy-enable reactions for history after page load
  useEffect(() => {
    const timer = setTimeout(() => setShowHistoryReactions(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div style={{ padding: 16, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <Alert
          type="error"
          message="Error"
          description={(error as Error).message}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 16, maxWidth: "100%", overflowX: "hidden" }}>
      <Title
        level={3}
        style={{
          fontSize: "clamp(18px, 4vw, 24px)",
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        📊 Demand Zone Reports
      </Title>

      {/* Today Section */}
      <Card title="Today’s Demand Zones" style={{ marginBottom: 24 }}>
        <Tabs
          tabPosition="top"
          items={[
            {
              key: "approaching",
              label: "Approaching",
              children: (
                <ZoneSection
                  title="Approaching Zones"
                  data={data?.today.approaching || []}
                  showReactions={true}
                />
              ),
            },
            {
              key: "entered",
              label: "Entered",
              children: (
                <ZoneSection
                  title="Entered Zones"
                  data={data?.today.entered || []}
                  showReactions={true}
                />
              ),
            },
            {
              key: "breached",
              label: "Breached",
              children: (
                <ZoneSection
                  title="Breached Zones"
                  data={data?.today.breached || []}
                  showReactions={true}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Daywise Section */}
      <Card title="Daywise History">
        {Object.entries(data?.history || {}).map(([date, statuses]) => (
          <div key={date} style={{ marginBottom: 24 }}>
            <Divider orientation="left">{date}</Divider>
            <Tabs
              tabPosition="top"
              items={Object.entries(statuses).map(([status, rows]) => ({
                key: status,
                label: status.charAt(0).toUpperCase() + status.slice(1),
                children: (
                  <ZoneSection
                    title={`${status.charAt(0).toUpperCase() + status.slice(1)} Zones`}
                    data={rows as any[]}
                    showReactions={showHistoryReactions}
                  />
                ),
              }))}
            />
          </div>
        ))}
      </Card>
    </div>
  );
}

export default ReportsPage;
