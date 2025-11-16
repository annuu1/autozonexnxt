"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Space,
  Tag,
  Typography,
  Drawer,
  Grid,
  Pagination,
  InputNumber,
  Select,
  Divider,
  Popconfirm,
} from "antd";
import {
  FilterOutlined,
  ReloadOutlined,
  BellOutlined,
  CopyOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import QuickAlertModal from "@/components/alerts/QuickAlertModal";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import Reactions from "@/components/ui/Reactions";

const { Title } = Typography;
const { useBreakpoint } = Grid;

export default function DemandZonesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(16);
  const [total, setTotal] = useState(0);

  const screens = useBreakpoint();

  // Filters
  const [proximalWithin, setProximalWithin] = useState<number>(3);
  const [compareTo, setCompareTo] = useState<"ltp" | "day_low">("ltp");
  const [useFilters, setUseFilters] = useState(false);

  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { copy, contextHolder } = useCopyToClipboard();

  const [quickAlertSymbol, setQuickAlertSymbol] = useState<string>("");
  const [quickAlertOpen, setQuickAlertOpen] = useState(false);

  const [includeSeen, setIncludeSeen] = useState<"true" | "false">("true");

  // Fetch Zones
  const fetchZones = () => {
    const baseUrl = useFilters
      ? `/api/demand-zones/filters?page=${page}&limit=${rowsPerPage}&proximalWithin=${proximalWithin}&compareTo=${compareTo}&includeSeen=${includeSeen}`
      : `/api/demand-zones?page=${page}&limit=${rowsPerPage}`;

    fetch(baseUrl)
      .then((res) => res.json())
      .then((res) => {
        setZones(res.data || []);
        setTotal(res.total || 0);
      });
  };

  useEffect(() => {
    fetchZones();
  }, [page, rowsPerPage, useFilters, proximalWithin, compareTo]);

  // 🔥 DELETE ZONE HANDLER
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
      fetchZones(); // refresh list
    } catch (err) {
      console.error("Failed to delete zone", err);
    }
  };

  const handleLastSeen = async (zoneId: string) => {
    try {
      const res = await fetch(`/api/demand-zones/${zoneId}/seen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update last seen");
      }

      fetchZones(); // refresh list
    } catch (err) {
      console.error("Failed to update last seen", err);
    }
  };

  const handleCardClick = (zone: any) => {
    setSelectedZone(zone);
    setDrawerOpen(true);
  };

  const openQuickAlert = (symbol: string) => {
    setQuickAlertSymbol(symbol);
    setQuickAlertOpen(true);
  };

  const formatNumber = (val: any) =>
    typeof val === "number" ? val.toFixed(2) : val;

  const getDiffTag = (diff: number) => {
    if (diff < 0) return <Tag color="red">{diff.toFixed(2)}%</Tag>;
    if (diff <= 1) return <Tag color="gold">{diff.toFixed(2)}%</Tag>;
    if (diff <= 3) return <Tag color="green">{diff.toFixed(2)}%</Tag>;
    return <Tag>{diff.toFixed(2)}%</Tag>;
  };

  return (
    <div style={{ padding: screens.xs ? 12 : 24 }}>
      {contextHolder}

      {/* Quick Alert Modal */}
      <QuickAlertModal
        open={quickAlertOpen}
        onClose={() => setQuickAlertOpen(false)}
        initialSymbol={quickAlertSymbol}
      />

      <Title level={3}>📈 Demand Zones</Title>

      {/* 🔹 Filters */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space
          wrap
          direction={screens.xs ? "vertical" : "horizontal"}
          style={{ width: "100%" }}
        >
          <InputNumber
            value={proximalWithin}
            min={0}
            max={100}
            addonAfter="%"
            onChange={(v) => setProximalWithin(v ?? 0)}
          />

          <Select
            value={compareTo}
            onChange={(v) => setCompareTo(v)}
            style={{ width: screens.xs ? "100%" : 150 }}
            options={[
              { value: "ltp", label: "LTP" },
              { value: "day_low", label: "Day Low" },
            ]}
          />
            {/* ⭐ NEW - Seen Filter */}
          <Select
            value={includeSeen}
            onChange={(v) => setIncludeSeen(v)}
            style={{ width: screens.xs ? "100%" : 160 }}
            options={[
              { value: "true", label: "Show All Zones" },
              { value: "false", label: "Hide Seen Zones" },
            ]}
          />

          <Button
            type="primary"
            icon={<FilterOutlined />}
            onClick={() => setUseFilters(true)}
            block={screens.xs}
          >
            Apply
          </Button>

          <Button
            icon={<ReloadOutlined />}
            onClick={() => setUseFilters(false)}
            block={screens.xs}
          >
            Reset
          </Button>
        </Space>
      </Card>

      {/* 🔹 Grid Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: screens.xs
            ? "1fr"
            : "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "16px",
        }}
      >
        {zones.map((zone) => {
          const ltp = zone.symbol_data?.ltp;
          const dayLow = zone.symbol_data?.day_low;

          return (
            <Card
              key={zone._id}
              className="shadow-sm"
              style={{ transition: "0.2s ease",
                border: zone.last_seen ? "2px solid #52c41a" : "1px solid #f0f0f0",
               }}
              bodyStyle={{ padding: 14 }}
            >
              {/* HEADER */}
              <div className="flex justify-between items-center mb-1">
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(zone);
                  }}
                  style={{
                    fontWeight: 600,
                    fontSize: 17,
                    cursor: "pointer",
                    color: "#1677ff",
                  }}
                >
                  {zone.ticker}
                </span>

                <CopyOutlined
                  onClick={(e) => {
                    e.stopPropagation();
                    copy(zone.ticker);
                    handleLastSeen(zone._id);
                  }}
                  style={{ cursor: "pointer", fontSize: 16 }}
                />
              </div>

              <Divider style={{ margin: "8px 0" }} />

              <div style={{ fontSize: 14 }}>
                <div>Timeframe: {zone.timeframes}</div>
                <div>Pattern: {zone.pattern}</div>
                <div>Proximal: {formatNumber(zone.proximal_line)}</div>
                <div>Distal: {formatNumber(zone.distal_line)}</div>
                <div>Freshness: {zone.freshness}</div>

                <div className="mt-1">
                  LTP:{" "}
                  {ltp ? (
                    <Space size={4}>
                      <span>{formatNumber(ltp)}</span>
                      {getDiffTag(
                        ((ltp - zone.proximal_line) /
                          zone.proximal_line) *
                          100
                      )}
                    </Space>
                  ) : (
                    "-"
                  )}
                </div>

                <div className="mt-1">
                  Day Low:{" "}
                  {dayLow ? (
                    <Space size={4}>
                      <span>{formatNumber(dayLow)}</span>
                      {getDiffTag(
                        ((dayLow - zone.proximal_line) /
                          zone.proximal_line) *
                          100
                      )}
                    </Space>
                  ) : (
                    "-"
                  )}
                </div>
              </div>

              {/* FOOTER: Alert Button */}
              <div className="flex justify-end mt-2" style={{ gap: 12 }}>
                 <div className="mr-3">
                                      <Reactions
                                        itemId={zone._id}
                                        type="zone"
                                        allItemIds={zones.map((z: any) => z._id)}
                                        teamPickEnabled
                                      />
                                    </div>

                {/* Quick Alert Button */}
                <BellOutlined
                  style={{
                    fontSize: 18,
                    color: "#1890ff",
                    cursor: "pointer",
                  }}
                  title="Set alert"
                  onClick={(e) => {
                    e.stopPropagation();
                    openQuickAlert(zone.ticker);
                  }}
                />

                {/* Delete Zone Button */}
                <Popconfirm
                  title="Delete this zone?"
                  okText="Yes"
                  cancelText="No"
                  onConfirm={(e) => {
                    e?.stopPropagation?.();
                    handleDelete(zone.zone_id);
                  }}
                >
                  <DeleteOutlined
                    style={{
                      fontSize: 18,
                      color: "red",
                      cursor: "pointer",
                    }}
                    title="Delete zone"
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <Pagination
          current={page}
          total={total}
          pageSize={rowsPerPage}
          onChange={(p) => setPage(p)}
          size="small"
        />
      </div>

      {/* 🔹 Drawer */}
      <Drawer
        title={`Zone Details: ${selectedZone?.ticker || ""}`}
        placement="right"
        width={screens.xs ? "100%" : 400}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        extra={
          selectedZone && (
            <Popconfirm
              title="Delete this zone?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => handleDelete(selectedZone._id)}
            >
              <Button danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          )
        }
      >
        {selectedZone &&
          Object.entries(selectedZone).map(([key, val]) => (
            <p key={key}>
              <strong>{key}: </strong>
              {Array.isArray(val) ? val.join(", ") : String(val)}
            </p>
          ))}
      </Drawer>
    </div>
  );
}
