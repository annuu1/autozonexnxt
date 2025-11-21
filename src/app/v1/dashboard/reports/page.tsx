"use client";

import React, { useEffect, useState } from "react";
import { Card, Typography, Spin, Alert, Divider, Tabs, Tag, Pagination, Button } from "antd";
import { useReports } from "@/hooks/useReports";
import Reactions from "@/components/ui/Reactions";
import { BellOutlined } from "@ant-design/icons";
import QuickAlertModal from "@/components/alerts/QuickAlertModal";

const { Title } = Typography;

function parseZoneId(zone_id: string) {
  if (!zone_id) return { symbol: "Unknown", timeframe: "Unknown", date: "Unknown" };

  const match = zone_id.match(/^(.+?)-([^-]+)-(\d{4}-\d{2}-\d{2})/);

  if (!match) {
    console.warn("Could not parse zone_id:", zone_id);
    return { symbol: "Unknown", timeframe: "Unknown", date: "Unknown" };
  }

  const [, symbol, timeframe, rawDate] = match;

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
  onQuickAlert,
}: {
  zone: any;
  allItemIds: string[];
  showReactions?: boolean;
  onQuickAlert: (symbol: string) => void;
}) {
  const { symbol, timeframe, date } = parseZoneId(zone.zone_id);

  function parseUtcTimeToLocal(zone: any) {
    const isoDateMatch = zone.zone_id.match(/\d{4}-\d{2}-\d{2}/);
    const datePart = isoDateMatch ? isoDateMatch[0] : null;

    if (!datePart || !zone.time) return zone.time;

    const time24h = (() => {
      const [time, modifier] = zone.time.toLowerCase().split(' ');
      let [hours, minutes] = time.split(':').map(Number);

      if (modifier === 'pm' && hours < 12) hours += 12;
      if (modifier === 'am' && hours === 12) hours = 0;

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    })();

    const utcDateTimeStr = `${datePart}T${time24h}Z`;
    const dateObj = new Date(utcDateTimeStr);

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <strong style={{ fontSize: 16 }}>{symbol}</strong>
          <BellOutlined
            onClick={(e) => {
              e.stopPropagation();
              onQuickAlert(symbol);
            }}
            style={{
              cursor: "pointer",
              color: "#1890ff",
              fontSize: 16,
            }}
            title="Set price alert"
          />
        </div>
        <span style={{ fontSize: 12, color: "#555" }}>{parseUtcTimeToLocal(zone)}</span>
      </div>

      <div className="mt-2 text-sm text-gray-600">
        <Tag color={timeframe === "1wk" ? "green" : timeframe === "1mo" ? "blue" : "orange"}>
          {timeframe}
        </Tag>
        <Tag>{date}</Tag>
      </div>

      <div className="mt-1 text-sm text-gray-700">
        Range: <strong>{zone.range}</strong>
      </div>

      {showReactions && (
        <div className="mt-3">
          <Reactions
            itemId={zone._id}
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
  onQuickAlert,
}: {
  title: string;
  data: any[];
  showReactions?: boolean;
  onQuickAlert: (symbol: string) => void;
}) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
        No zones found
      </div>
    );
  }

  const allIds = data.map((z) => z._id);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {data.map((zone) => (
        <ZoneCard
          key={zone._id}
          zone={zone}
          allItemIds={allIds}
          showReactions={showReactions}
          onQuickAlert={onQuickAlert}
        />
      ))}
    </div>
  );
}

function ReportsPage() {
  const [showHistory, setShowHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [showHistoryReactions, setShowHistoryReactions] = useState(false);

  const [quickAlertSymbol, setQuickAlertSymbol] = useState<string>("");
  const [quickAlertOpen, setQuickAlertOpen] = useState(false);

  const openQuickAlert = (symbol: string) => {
    setQuickAlertSymbol(symbol);
    setQuickAlertOpen(true);
  };

  // Fetch today's data (always)
  const { data: todayData, isLoading: todayLoading, error: todayError } = useReports({
    includeHistory: false,
  });

  // Fetch historical data (only when showHistory is true)
  const {
    data: historyData,
    isLoading: historyLoading,
    error: historyError
  } = useReports({
    includeHistory: showHistory,
    page: historyPage,
    limit: 1, // One day per page
  });

  // Lazy-enable reactions for history after showing
  useEffect(() => {
    if (showHistory) {
      const timer = setTimeout(() => setShowHistoryReactions(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowHistoryReactions(false);
    }
  }, [showHistory]);

  // Reset to page 1 when toggling history
  useEffect(() => {
    if (!showHistory) {
      setHistoryPage(1);
    }
  }, [showHistory]);

  const isLoading = todayLoading || (showHistory && historyLoading);
  const error = todayError || historyError;

  if (todayLoading) {
    return (
      <div style={{ padding: 16, textAlign: "center" }}>
        <Spin size="large" tip="Loading today's zones..." />
      </div>
    );
  }

  if (todayError || !todayData) {
    return (
      <div style={{ padding: 16 }}>
        <Alert
          type="error"
          message="Error"
          description={(todayError as Error)?.message || "Failed to load reports"}
        />
      </div>
    );
  }

  const historyDates = Object.keys(historyData?.history || {});
  const currentDate = historyDates[0]; // Since we're fetching one day at a time
  const currentHistoryData = currentDate ? historyData.history[currentDate] : null;
  const pagination = historyData?.pagination;

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

      <QuickAlertModal
        open={quickAlertOpen}
        onClose={() => setQuickAlertOpen(false)}
        initialSymbol={quickAlertSymbol}
      />

      {/* Today Section */}
      <Card title="Today's Demand Zones" style={{ marginBottom: 24 }}>
        <Tabs
          tabPosition="top"
          items={[
            {
              key: "approaching",
              label: `Approaching (${todayData?.today?.approaching?.length || 0})`,
              children: (
                <ZoneSection
                  title="Approaching Zones"
                  data={todayData?.today?.approaching || []}
                  showReactions={true}
                  onQuickAlert={openQuickAlert}
                />
              ),
            },
            {
              key: "entered",
              label: `Entered (${todayData?.today?.entered?.length || 0})`,
              children: (
                <ZoneSection
                  title="Entered Zones"
                  data={todayData?.today?.entered || []}
                  showReactions={true}
                  onQuickAlert={openQuickAlert}
                />
              ),
            },
            {
              key: "breached",
              label: `Breached (${todayData?.today?.breached?.length || 0})`,
              children: (
                <ZoneSection
                  title="Breached Zones"
                  data={todayData?.today?.breached || []}
                  showReactions={true}
                  onQuickAlert={openQuickAlert}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Historical Section Toggle */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Historical Data</span>
            <Button
              type={showHistory ? "default" : "primary"}
              onClick={() => setShowHistory(!showHistory)}
              loading={showHistory && historyLoading}
            >
              {showHistory ? "Hide History" : "Show History"}
            </Button>
          </div>
        }
      >
        {!showHistory ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            Click "Show History" to view past demand zones
          </div>
        ) : historyLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" tip="Loading historical data..." />
          </div>
        ) : historyError ? (
          <Alert
            type="error"
            message="Error loading history"
            description={(historyError as Error)?.message || "Failed to load historical data"}
          />
        ) : !pagination || pagination.totalDays === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            No historical data available
          </div>
        ) : (
          <>
            {/* Current Date History */}
            <div style={{ marginBottom: 24 }}>
              <Divider orientation="left">
                <strong>{currentDate}</strong>
              </Divider>
              <Tabs
                tabPosition="top"
                items={[
                  {
                    key: "approaching",
                    label: `Approaching (${currentHistoryData?.approaching?.length || 0})`,
                    children: (
                      <ZoneSection
                        title="Approaching Zones"
                        data={currentHistoryData?.approaching || []}
                        showReactions={showHistoryReactions}
                        onQuickAlert={openQuickAlert}
                      />
                    ),
                  },
                  {
                    key: "entered",
                    label: `Entered (${currentHistoryData?.entered?.length || 0})`,
                    children: (
                      <ZoneSection
                        title="Entered Zones"
                        data={currentHistoryData?.entered || []}
                        showReactions={showHistoryReactions}
                        onQuickAlert={openQuickAlert}
                      />
                    ),
                  },
                  {
                    key: "breached",
                    label: `Breached (${currentHistoryData?.breached?.length || 0})`,
                    children: (
                      <ZoneSection
                        title="Breached Zones"
                        data={currentHistoryData?.breached || []}
                        showReactions={showHistoryReactions}
                        onQuickAlert={openQuickAlert}
                      />
                    ),
                  },
                ]}
              />
            </div>

            {/* Pagination */}
            {pagination && pagination.totalDays > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                <Pagination
                  current={historyPage}
                  total={pagination.totalDays}
                  pageSize={1}
                  onChange={(page) => setHistoryPage(page)}
                  showSizeChanger={false}
                  showTotal={(total) => `${total} days of history`}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default ReportsPage;