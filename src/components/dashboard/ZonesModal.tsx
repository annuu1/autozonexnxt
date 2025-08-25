"use client";
import { Modal, Table, Button } from "antd";
import { getDiffTag, getLastSeenTag } from "./ZoneHelpers";

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
  const zoneColumns = [
    {
      title: "Ticker",
      dataIndex: "ticker",
      key: "ticker",
      render: (_: any, row: any) => (
        <Button type="link" onClick={() => onTickerClick(row)}>
          {row.ticker}
          <div style={{ fontSize: 12 }}>{getLastSeenTag(row.last_seen)}</div>
        </Button>
      ),
    },
    { title: "Zone ID", dataIndex: "zone_id", key: "zone_id" },
    { title: "Proximal", dataIndex: "proximal_line", key: "proximal_line" },
    { title: "Distal", dataIndex: "distal_line", key: "distal_line" },
    { title: "Pattern", dataIndex: "pattern", key: "pattern" },
    { title: "Freshness", dataIndex: "freshness", key: "freshness" },
    { title: "Trade Score", dataIndex: "trade_score", key: "trade_score" },
    { title: "Day Low", dataIndex: "day_low", key: "day_low" },
    {
      title: "Diff %",
      dataIndex: "percentDiff",
      key: "percentDiff",
      render: (v: number) => getDiffTag(v * 100),
    },
  ];

  return (
    <Modal
      title="Zones Near Day Low (within 3%)"
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
