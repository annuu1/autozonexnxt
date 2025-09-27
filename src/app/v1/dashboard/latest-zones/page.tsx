"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Alert,
  Typography,
  Tag,
  Drawer,
  Descriptions,
  Grid,
  Spin,
} from "antd";
import { CopyOutlined, LockOutlined } from "@ant-design/icons";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import useAuthGuard from "@/hooks/useAuthGuard";

const { Title } = Typography;
const { useBreakpoint } = Grid;

// Helper function to get color for timeframe tags
const getTimeframeColor = (timeframe: string) => {
  switch (timeframe) {
    case "1wk":
      return "cyan";
    case "1mo":
      return "purple";
    case "3mo":
      return "orange";
    case "1d":
      return "blue";
    default:
      return "default";
  }
};

export default function LatestZonesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<"1wk" | "1mo" | "3mo">("1wk");
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const screens = useBreakpoint();
  const { copy, contextHolder } = useCopyToClipboard();
  const { user } = useAuthGuard();
  const canDelete = user?.roles?.includes("admin") || user?.roles?.includes("manager");

  const plan = user?.subscription?.plan;
  const status = user?.subscription?.status;

  useEffect(() => {
    const fetchZones = async () => {
      if (!user) return;
      if (status !== "active") return; // inactive → no fetch
      if (plan === "trial") return; // trial → no fetch

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v1/dashboard/zone/latest?timeframe=${selectedTimeframe}`, {
          method: "GET",
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch zones (${res.status})`);
        }
        const data = await res.json();
        setZones(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchZones();
  }, [selectedTimeframe, user, plan, status]);

  const handleCardClick = (zone: any) => {
    setSelectedZone(zone);
    setDrawerOpen(true);
  };

  const handleDelete = async (zoneId: string) => {
    try {
      const res = await fetch(`/api/v1/dashboard/zone/${zoneId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete zone");
      }

      setZones(zones.filter((zone) => zone.zone_id !== zoneId));
      setDrawerOpen(false);
    } catch (err) {
      console.error("Failed to delete zone", err);
      setError("Failed to delete zone");
    }
  };

  return (
    <div style={{ padding: screens.xs ? 12 : 20, maxWidth: "1200px", margin: "0 auto" }}>
      {contextHolder}
      <Title level={3}>Latest {selectedTimeframe} Zones</Title>

      {/* Timeframe buttons */}
      <div style={{ marginBottom: "24px" }}>
        {["1wk", "1mo", "3mo"].map((tf) => (
          <Button
            key={tf}
            type={selectedTimeframe === tf ? "primary" : "default"}
            onClick={() => setSelectedTimeframe(tf as "1wk" | "1mo" | "3mo")}
            style={{ marginRight: "8px" }}
          >
            {tf === "1wk" ? "1 Week" : tf === "1mo" ? "1 Month" : "3 Months"}
          </Button>
        ))}
      </div>

      {/* Subscription checks */}
      {status !== "active" && (
        <Alert
          message="Subscription inactive"
          description="Please activate your subscription to view latest zones."
          type="warning"
          showIcon
          style={{ marginBottom: "24px" }}
        />
      )}

      {plan === "trial" && status === "active" && (
        <Alert
          message="Not available on Trial"
          description="Latest zones are not included in the Trial plan. Please upgrade to access this feature."
          type="info"
          showIcon
          style={{ marginBottom: "24px" }}
        />
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" tip="Loading latest zones..." />
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: "24px" }}
        />
      )}

      {/* Zones */}
      {!loading && !error && status === "active" && plan !== "trial" && zones.length === 0 && (
        <Alert
          message={`No zones found for the latest ${selectedTimeframe} period.`}
          type="info"
          showIcon
          style={{ marginBottom: "24px" }}
        />
      )}

      {!loading && !error && status === "active" && plan !== "trial" && zones.length > 0 && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: screens.xs ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            {(plan === "freemium" ? zones.slice(0, 9) : zones).map((zone) => {
              const match = zone.zone_id?.match(/\d{4}-\d{2}-\d{2}/);
              const formattedDate = match
                ? new Date(match[0]).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "Asia/Kolkata",
                  })
                : null;

              return (
                <div
                  key={zone._id}
                  className="p-3 border rounded-md bg-white shadow-sm cursor-pointer hover:shadow-md transition"
                  style={{ transition: "transform 0.15s ease-in-out, box-shadow 0.15s" }}
                  onClick={() => handleCardClick(zone)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <strong>{zone.ticker}</strong>
                      <div>
                        {(zone.timeframes || []).map((f: string) => (
                          <Tag key={f} color={getTimeframeColor(f)} style={{ margin: 0 }}>
                            {f}
                          </Tag>
                        ))}
                      </div>
                      <CopyOutlined
                        onClick={(e) => {
                          e.stopPropagation();
                          copy(zone.ticker);
                        }}
                        style={{ cursor: "pointer", color: "#555" }}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {formattedDate && <div>Date: {formattedDate}</div>}
                    <div>Pattern: {zone.pattern}</div>
                    <div>Proximal: {Number(zone.proximal_line).toFixed(2)}</div>
                    <div>Distal: {Number(zone.distal_line).toFixed(2)}</div>
                    <div>Trade Score: {zone.trade_score}</div>
                    <div>Freshness: {zone.freshness}</div>
                    <div>Coinciding Zones: {zone.coinciding_lower_zones.length}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Locked message for Freemium */}
          {plan === "freemium" && zones.length > 9 && (
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <LockOutlined style={{ fontSize: 20, marginRight: 8, color: "#999" }} />
              <span>
                Upgrade to <b>Starter</b> plan to unlock all latest zones.
              </span>
            </div>
          )}
        </>
      )}

      {/* Drawer */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>Zone Details: {selectedZone?.ticker || ""}</span>
            {selectedZone?.ticker && (
              <CopyOutlined
                onClick={() => copy(selectedZone?.ticker)}
                style={{ cursor: "pointer", color: "#1890ff" }}
              />
            )}
          </div>
        }
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={screens.xs ? "100%" : 400}
        extra={
          selectedZone && canDelete && (
            <Button danger onClick={() => handleDelete(selectedZone.zone_id)}>
              Delete
            </Button>
          )
        }
      >
        {selectedZone && (
          <Descriptions column={1} bordered size="small">
            {Object.entries(selectedZone).map(([key, value]) => (
              <Descriptions.Item key={key} label={key}>
                {Array.isArray(value) ? value.join(", ") : value?.toString()}
              </Descriptions.Item>
            ))}
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
