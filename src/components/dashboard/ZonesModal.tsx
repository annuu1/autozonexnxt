"use client";
import { Modal, Table, Button, Grid, Pagination, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { useState } from "react";
import { getDiffTag, getLastSeenTag } from "./ZoneHelpers";
import useAuthStore from "@/store/useAuthStore";

const { useBreakpoint } = Grid;

export default function ZonesModal({
  open,
  onClose,
  zones,
  loading,
  onTickerClick,
}: {
  open: boolean;
  onClose: () => void;
  zones: any[];
  loading: boolean;
  onTickerClick: (zone: any) => void;
}) {
  const screens = useBreakpoint();
  const { user } = useAuthStore();

  const roles = Array.isArray(user?.roles) ? user?.roles : [];
  const isAdmin = roles.includes("admin");

  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [messageApi, contextHolder] = message.useMessage();

  const paginatedZones = zones?.slice((page - 1) * pageSize, page * pageSize);

  // 📋 Copy function with feedback
  const handleCopy = (ticker: string) => {
    navigator.clipboard.writeText(ticker).then(() => {
      messageApi.success(`${ticker} copied to clipboard`);
    });
  };

  const renderTicker = (row: any) => {
    return (
      <div className="flex items-center gap-2">
        {isAdmin ? (
          <Button type="link" onClick={() => onTickerClick(row)}>
            {row.ticker}
            <div style={{ fontSize: 12 }}>{getLastSeenTag(row.last_seen)}</div>
          </Button>
        ) : (
          <span>{row.ticker}</span>
        )}
        <CopyOutlined
          onClick={() => handleCopy(row.ticker)}
          style={{ cursor: "pointer", color: "#555" }}
        />
      </div>
    );
  };

  const zoneColumns = [
    {
      title: "Ticker",
      dataIndex: "ticker",
      key: "ticker",
      render: (_: any, row: any) => renderTicker(row),
    },
    { title: "Zone ID", dataIndex: "zone_id", key: "zone_id" },
    {
      title: "Proximal",
      dataIndex: "proximal_line",
      key: "proximal_line",
      render: (v: number) => v.toFixed(2),
    },
    {
      title: "Distal",
      dataIndex: "distal_line",
      key: "distal_line",
      render: (v: number) => v.toFixed(2),
    },
    { title: "Pattern", dataIndex: "pattern", key: "pattern" },
    { title: "Freshness", dataIndex: "freshness", key: "freshness" },
    { title: "Trade Score", dataIndex: "trade_score", key: "trade_score" },
    {
      title: "Day Low",
      dataIndex: "day_low",
      key: "day_low",
      render: (v: number) => v.toFixed(2),
    },
    {
      title: "Diff %",
      dataIndex: "percentDiff",
      key: "percentDiff",
      render: (v: number) => getDiffTag(v * 100),
    },
  ];

  return (
    <>
      {contextHolder} {/* ✅ Needed for toast to appear */}
      <Modal
        title="Zones in Action"
        open={open}
        onCancel={onClose}
        footer={null}
        width="85%"
      >
        {screens.xs ? (
          <>
            <div className="space-y-3">
              {paginatedZones?.map((zone) => (
                <div
                  key={zone._id}
                  className="p-3 border rounded-md bg-white shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    {isAdmin ? (
                      <Button type="link" onClick={() => onTickerClick(zone)}>
                        {zone.ticker}
                        <div>{getLastSeenTag(zone.last_seen)}</div>
                      </Button>
                    ) : (
                      <div className="font-bold">{zone.ticker}</div>
                    )}
                    <CopyOutlined
                      onClick={() => handleCopy(zone.ticker)}
                      style={{ cursor: "pointer", color: "#555" }}
                    />
                  </div>
                  <div>Proximal: {zone.proximal_line.toFixed(2)}</div>
                  <div>Distal: {zone.distal_line.toFixed(2)}</div>
                  <div>Diff: {getDiffTag(zone.percentDiff * 100)}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <Pagination
                current={page}
                pageSize={pageSize}
                total={zones?.length}
                onChange={(p) => setPage(p)}
                size="small"
              />
            </div>
          </>
        ) : (
          <Table
            dataSource={zones}
            columns={zoneColumns}
            rowKey="_id"
            loading={loading}
            bordered
            pagination={{ pageSize: 10 }}
          />
        )}
      </Modal>
    </>
  );
}
