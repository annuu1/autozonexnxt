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
  Input,
} from "antd";
import {
  StarFilled,
  CopyOutlined,
  ThunderboltOutlined,
  BellOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useScanner } from "@/hooks/useScanner";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import Reactions from "@/components/ui/Reactions";
import TeamsPickModal from "@/components/scanner/TeamsPickModal";
import QuickAlertModal from "@/components/alerts/QuickAlertModal";
import useAuthStore from "@/store/useAuthStore";

const { Title } = Typography;
const { useBreakpoint } = Grid;

const getTimeframeColor = (timeframe: string) => {
  switch (timeframe) {
    case "1wk": return "cyan";
    case "1mo": return "purple";
    case "3mo": return "orange";
    case "1d": return "blue";
    default: return "default";
  }
};

export default function ScannerPage() {
  const {
    filteredZones,
    timeframe,
    setTimeframe,
    zoneFilter,
    setZoneFilter,
    isLoading,
    error,
    search,
    setSearch,
    marketWatch,
    setMarketWatch,
  } = useScanner();

  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [quickAlertSymbol, setQuickAlertSymbol] = useState<string>("");
  const [quickAlertOpen, setQuickAlertOpen] = useState(false);
  const pageSize = 16;

  const screens = useBreakpoint();
  const { copy, contextHolder } = useCopyToClipboard();

  const paginatedZones = filteredZones.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const [teamsPickOpen, setTeamsPickOpen] = useState(false);
  const { user } = useAuthStore();
  const canDelete =
    user?.roles?.includes("admin") || user?.roles?.includes("manager");

  const handleCardClick = (zone: any, locked = false) => {
    if (locked) return; // don’t open locked cards
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

  const isFreemium = user?.subscription?.plan === "freemium";
  const isLockedPage = isFreemium && page > 2;

  const openQuickAlert = (symbol: string) => {
    setQuickAlertSymbol(symbol);
    setQuickAlertOpen(true);
  };


  return (
    <div style={{ padding: screens.xs ? 12 : 20 }}>
      {contextHolder}

      {/* Quick Alert Modal (controlled) */}
      <QuickAlertModal
        open={quickAlertOpen}
        onClose={() => setQuickAlertOpen(false)}
        initialSymbol={quickAlertSymbol}
      />

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

          <Select
            value={marketWatch}
            onChange={setMarketWatch}
            style={{ width: screens.xs ? "100%" : 150 }}
            options={[
              { value: "nifty_50", label: "Nifty 50" },
              { value: "nifty_100", label: "Nifty 100" },
              { value: "nifty_200", label: "Nifty 200" },
              { value: "nifty_500", label: "Nifty 500" },
              { value: "small_cap", label: "Small Cap" },
              { value: "mid_cap", label: "Mid Cap" },
              { value: "large_cap", label: "Large Cap" },
              { value: "all", label: "All" },
            ]}
          />

          <Input.Search
            placeholder="Search by ticker"
            defaultValue={search}
            onSearch={(value) => setSearch(value)}
            style={{ width: screens.xs ? "100%" : 200 }}
            allowClear
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

          {/* Floating Quick Alert */}
          {/* <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            style={{
              borderRadius: 30,
              height: 48,
              padding: "0 20px",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(24,144,255,0.3)",
            }}
            onClick={() => setQuickAlertOpen(true)}
          >
            Quick Alert
          </Button> */}
        </Space>

        <TeamsPickModal
          open={teamsPickOpen}
          onClose={() => setTeamsPickOpen(false)}
        />

        {/* Banner for locked pages */}
        {isLockedPage && (
          <Alert
            type="warning"
            showIcon
            style={{ marginTop: 12 }}
            message="Upgrade Required"
            description={
              <span>
                You are on a <strong>Freemium Plan</strong>. Only{" "}
                <strong>2 pages</strong> are accessible. Upgrade to unlock full
                Zone Scanner access.
              </span>
            }
            action={
              <Button
                type="primary"
                size="small"
                onClick={() => (window.location.href = "/v1/dashboard/billing")}
              >
                Upgrade Now
              </Button>
            }
          />
        )}

        {/* Data */}
        {isLoading ? (
          <Spin tip="Loading zones..." fullscreen />
        ) : error ? (
          <Alert type="error" message="Failed to fetch zones" />
        ) : filteredZones.length === 0 ? (
          <Alert type="info" message="No zones available" />
        ) : (
          <>
            {/* Grid of Cards */}
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
                const locked = isLockedPage;

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
                    className="p-3 border rounded-md bg-white shadow-sm cursor-pointer relative"
                    style={{
                      transition:
                        "transform 0.15s ease-in-out, box-shadow 0.15s",
                      ...(locked && {
                        filter: "blur(3px)",
                        userSelect: "none", // ✅ disable selection
                        pointerEvents: "none", // ✅ disable interaction
                      }),
                    }}
                  >
                    {/* Overlay lock */}
                    {locked && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          background: "rgba(255,255,255,0.7)",
                          borderRadius: 8,
                          zIndex: 10,
                          userSelect: "none",
                          pointerEvents: "auto", // allow upgrade button click
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <LockOutlined
                            style={{ fontSize: 28, color: "#faad14" }}
                          />
                          <Button
                            type="primary"
                            size="small"
                            onClick={() =>
                              (window.location.href = "/v1/dashboard/billing")
                            }
                          >
                            Upgrade
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Card content */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <strong onClick={() => handleCardClick(zone)}>{zone.ticker}</strong>

                        <Space size={4}>
                          {(zone.timeframes || []).map((f: string) => (
                            <Tag
                              key={f}
                              color={getTimeframeColor(f)}
                              style={{ margin: 0 }}
                            >
                              {f}
                            </Tag>
                          ))}
                        </Space>
                        <CopyOutlined
                          onClick={(e) => {
                            e.stopPropagation();
                            copy(zone.ticker);
                          }}
                          style={{ cursor: "pointer", color: "#555" }}
                        />

                        {/* Alert Button */}
                        <BellOutlined
                          onClick={(e) => {
                            e.stopPropagation();
                            openQuickAlert(zone.ticker);
                          }}
                          style={{
                            cursor: "pointer",
                            color: "#1890ff",
                            fontSize: 16,
                          }}
                          title="Set price alert"
                        />
                      </div>
                      <Tag
                        color={zone.status === "entered" ? "green" : "blue"}
                      >
                        {zone.status?.toUpperCase()}
                      </Tag>
                    </div>

                    <div className="mt-2 text-sm text-gray-600">
                      {formattedDate && <div>Legout: {formattedDate}</div>}
                      <div>Pattern: {zone.pattern}</div>
                      <div>Proximal: {zone.proximal_line?.toFixed(2)}</div>
                      <div>Distal: {zone.distal_line?.toFixed(2)}</div>
                      <div>
                        Approach:{" "}
                        <span
                          style={{ fontWeight: "bold", color: "#d46b08" }}
                        >
                          {zone.percentDiff.toFixed(3)}%
                        </span>
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
                  {Array.isArray(value)
                    ? value.join(", ")
                    : value?.toString()}
                </Descriptions.Item>
              ))}
            </Descriptions>
          )}
        </Drawer>
      </Space>
    </div>
  );
}