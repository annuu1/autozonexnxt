"use client";
import { Modal, Table, Button } from "antd";
import { getDiffTag, getLastSeenTag } from "./ZoneHelpers";
import useAuthStore from "@/store/useAuthStore";


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


  const { user } = useAuthStore();

  const zoneColumns = [
    {
      title: "Ticker",
      dataIndex: "ticker",
      key: "ticker",
      render: (_: any, row: any) => {
        if (user?.roles.includes("admin")) {
          return (
            <Button type="link" onClick={() => onTickerClick(row)}>
              {row.ticker}
              <div style={{ fontSize: 12 }}>{getLastSeenTag(row.last_seen)}</div>
            </Button>
          );
        }
  
        return <span>{row.ticker}</span>;
      },
    },
    { title: "Zone ID", dataIndex: "zone_id", key: "zone_id" },
    { title: "Proximal", 
      dataIndex: "proximal_line", 
      key: "proximal_line",
      render: (v: number) => v.toFixed(2), },
    { title: "Distal", 
      dataIndex: "distal_line", 
      key: "distal_line",
      render: (v: number) => v.toFixed(2), },
    { title: "Pattern", dataIndex: "pattern", key: "pattern" },
    { title: "Freshness", dataIndex: "freshness", key: "freshness" },
    { title: "Trade Score", dataIndex: "trade_score", key: "trade_score" },
    { title: "Day Low", dataIndex: "day_low", key: "day_low", render: (v: number) => v.toFixed(2), },
    {
      title: "Diff %",
      dataIndex: "percentDiff",
      key: "percentDiff",
      render: (v: number) => getDiffTag(v * 100),
    },
  ];

  return (
    <Modal
      title="Zones in Action"
      open={open}
      onCancel={onClose}
      footer={null}
      width="85%"
    >
      <Table
        dataSource={zones}
        columns={zoneColumns}
        rowKey="_id"
        loading={loading}
        bordered
      />
    </Modal>
  );
}
