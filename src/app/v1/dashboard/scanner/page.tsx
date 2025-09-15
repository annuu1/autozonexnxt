"use client";
import React, { useState } from "react";
import {
  Select,
  Button,
  Space,
  Tag,
  Typography,
  Drawer,
  Descriptions,
  Spin,
  Alert,
  Grid,
  Pagination,
} from "antd";
import { StarFilled, CopyOutlined } from "@ant-design/icons";
import { useScanner } from "@/hooks/useScanner";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import Reactions from "@/components/ui/Reactions";
import TeamsPickModal from "@/components/scanner/TeamsPickModal";
import useAuthStore from "@/store/useAuthStore";

const { Title } = Typography;
const { useBreakpoint } = Grid;

export default function ScannerPage() {
  const {
    filteredZones,
    timeframe,
    setTimeframe,
    zoneFilter,
    setZoneFilter,
    isLoading,
    error,
  } = useScanner();

  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 16;

  const screens = useBreakpoint();
  const { copy, contextHolder } = useCopyToClipboard();

  const paginatedZones = filteredZones.slice((page - 1) * pageSize, page * pageSize);
  const [teamsPickOpen, setTeamsPickOpen] = useState(false);
  const { user } = useAuthStore();
  const canDelete = user?.roles?.includes("admin") || user?.roles?.includes("manager");

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

      setDrawerOpen(false);
    } catch (err) {
      console.error("Failed to delete zone", err);
    }
  };

  return (
    <div style={{ padding: screens.xs ? 12 : 20 }}>
      {contextHolder}
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={3}>Zone Scanner</Title>

        {/* Filters */}
        <Space
          wrap
          direction={screens.xs ? "vertical" : "horizontal"}
          style={{ width: "100%" }}
        >
          <Select
            value={timeframe}
            onChange={setTimeframe}
            style={{ width: screens.xs ? "100%" : 150 }}
            options={[
              { value: "all", label: "All" },
              { value: "1wk", label: "1 Week" },
              { value: "1mo", label: "1 Month" },
              { value: "3mo", label: "3 Months" },
            ]}
          />

          <Button
            type={zoneFilter === "approaching" ? "primary" : "default"}
            block={screens.xs}
            onClick={() =>
              setZoneFilter(zoneFilter === "approaching" ? null : "approaching")
            }
          >
            Approaching
          </Button>

          <Button
            type={zoneFilter === "entered" ? "primary" : "default"}
            block={screens.xs}
            onClick={() =>
              setZoneFilter(zoneFilter === "entered" ? null : "entered")
            }
          >
            Entered
          </Button>

          <Button
            type="default"
            block={screens.xs}
            style={{
              backgroundColor: "#fffbe6",
              borderColor: "#d4b106",
              fontWeight: "bold",
            }}
            icon={<StarFilled style={{ color: "#faad14" }} />}
            onClick={() => setTeamsPickOpen(true)}
          >
            Team’s Pick
          </Button>
        </Space>

        <TeamsPickModal open={teamsPickOpen} onClose={() => setTeamsPickOpen(false)} />

        {/* Data */}
        {isLoading ? (
          <Spin tip="Loading zones..." fullscreen />
        ) : error ? (
          <Alert type="error" message="Failed to fetch zones" />
        ) : filteredZones.length === 0 ? (
          <Alert type="info" message="No zones available" />
        ) : (
          <>
            {/* ✅ Grid of Cards for both Desktop + Mobile */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: screens.xs
                  ? "1fr"
                  : "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "16px",
              }}
            >
              {paginatedZones.map((zone) => {
                const match = zone.zone_id?.match(/\d{4}-\d{2}-\d{2}/);
                const formattedDate = match
                  ? new Date(match[0]).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : null;

                return (
                  <div
                    key={zone._id}
                    className="p-3 border rounded-md bg-white shadow-sm cursor-pointer hover:shadow-md transition"
                    style={{
                      transition: "transform 0.15s ease-in-out, box-shadow 0.15s",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <strong onClick={() => handleCardClick(zone)}>{zone.ticker}</strong>
                        <CopyOutlined
                          onClick={(e) => {
                            e.stopPropagation();
                            copy(zone.ticker);
                          }}
                          style={{ cursor: "pointer", color: "#555" }}
                        />
                      </div>
                      <Tag color={zone.status === "entered" ? "green" : "blue"}>
                        {zone.status?.toUpperCase()}
                      </Tag>
                    </div>

                    <div className="mt-2 text-sm text-gray-600">
                      {formattedDate && <div>Date: {formattedDate}</div>}
                      <div>Pattern: {zone.pattern}</div>
                      <div>Proximal: {zone.proximal_line?.toFixed(2)}</div>
                      <div>Distal: {zone.distal_line?.toFixed(2)}</div>
                      <div>
                        Timeframes:{" "}
                        {(zone.timeframes || []).map((f: string) => (
                          <Tag key={f}>{f}</Tag>
                        ))}
                      </div>
                    </div>

                    <div className="mt-2">
                      <Reactions
                        itemId={zone._id}
                        type="zone"
                        allItemIds={filteredZones.map((z: any) => z._id)}
                        teamPickEnabled
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-4">
              <Pagination
                current={page}
                pageSize={pageSize}
                total={filteredZones.length}
                onChange={(p) => setPage(p)}
                size="small"
              />
            </div>
          </>
        )}

        {/* Drawer for details */}
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
      </Space>
    </div>
  );
}
