"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Spin,
  Alert,
  Typography,
  Tag,
  Drawer,
  Descriptions,
  Grid,
} from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import useAuthStore from "@/store/useAuthStore";

const { Title } = Typography;
const { useBreakpoint } = Grid;

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

export default function HTFZonesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<"1wk" | "1mo" | "3mo">("1wk");
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const screens = useBreakpoint();
  const { copy, contextHolder } = useCopyToClipboard();
  const { user } = useAuthStore();
  const canDelete = user?.roles?.includes("admin") || user?.roles?.includes("manager");

  useEffect(() => {
    const fetchZones = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v1/dashboard/zone/htf?timeframe=${selectedTimeframe}`, {
          method: "GET",
          credentials: "include", // important to send cookie
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `Failed to fetch zones (${res.status})`);
        }
        const data = await res.json();
        setZones(data.zones || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
  }, [selectedTimeframe]);

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
      <Title level={3}>HTF Zones ({selectedTimeframe})</Title>

      <div style={{ marginBottom: "24px" }}>
        <Button
          type={selectedTimeframe === "1wk" ? "primary" : "default"}
          onClick={() => setSelectedTimeframe("1wk")}
          style={{ marginRight: "8px" }}
        >
          1 Week
        </Button>
        <Button
          type={selectedTimeframe === "1mo" ? "primary" : "default"}
          onClick={() => setSelectedTimeframe("1mo")}
          style={{ marginRight: "8px" }}
        >
          1 Month
        </Button>
        <Button
          type={selectedTimeframe === "3mo" ? "primary" : "default"}
          onClick={() => setSelectedTimeframe("3mo")}
        >
          3 Months
        </Button>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" tip="Loading HTF zones..." />
        </div>
      )}

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: "24px" }}
        />
      )}

      {!loading && !error && zones.length === 0 && (
        <Alert
          message={`No HTF zones found for ${selectedTimeframe} timeframe.`}
          type="info"
          showIcon
          style={{ marginBottom: "24px" }}
        />
      )}

      {!loading && !error && zones.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: screens.xs ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {zones.map((zone) => {
            const formattedDate = zone.createdAt
              ? new Date(zone.createdAt).toLocaleDateString("en-IN", {
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
                  <div>Coinciding Zones: {zone.coinciding_lower_zones?.length || 0}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
