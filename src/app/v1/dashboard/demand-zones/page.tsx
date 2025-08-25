"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  InputNumber,
  Select,
  Button,
  Space,
  Tag,
  Card,
  Typography,
  Divider,
  List,
  Grid,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { useBreakpoint } = Grid;

export default function DemandZonesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const screens = useBreakpoint(); // 🔹 detect screen size

  // 🔹 Filters
  const [proximalWithin, setProximalWithin] = useState<number>(3);
  const [compareTo, setCompareTo] = useState<"ltp" | "day_low">("ltp");
  const [useFilters, setUseFilters] = useState(false);

  // fetch zones
  useEffect(() => {
    const baseUrl = useFilters
      ? `/api/demand-zones/filters?page=${page}&limit=${rowsPerPage}&proximalWithin=${proximalWithin}&compareTo=${compareTo}`
      : `/api/demand-zones?page=${page}&limit=${rowsPerPage}`;

    fetch(baseUrl)
      .then((res) => res.json())
      .then((res) => {
        setZones(res.data);
        setTotal(res.total);
      });
  }, [page, rowsPerPage, useFilters, proximalWithin, compareTo]);

  const formatNumber = (val: any) =>
    typeof val === "number" ? val.toFixed(2) : val;

  // Handle symbol click → update last seen
  const handleSymbolClick = async (zone: any) => {
    try {
      const res = await fetch(`/api/demand-zones/${zone._id}/seen`, {
        method: "POST",
      });
      const updated = await res.json();
      const lastSeen = updated?.data?.last_seen ?? new Date().toISOString();

      setZones((prev) =>
        prev.map((z) =>
          z._id === zone._id ? { ...z, last_seen: lastSeen } : z
        )
      );
    } catch (err) {
      console.error("Error updating last seen:", err);
    }
  };

  const getLastSeenLabel = (lastSeen: string | null) => {
    if (!lastSeen) return <Tag color="blue">New</Tag>;
    const seenDate = new Date(lastSeen);
    const today = new Date();
    const diffDays = Math.floor(
      (today.getTime() - seenDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return <Tag color="green">Today</Tag>;
    if (diffDays <= 3)
      return <Tag color="lime">{seenDate.toLocaleDateString()}</Tag>;
    if (diffDays <= 10)
      return <Tag color="orange">{seenDate.toLocaleDateString()}</Tag>;
    return <Tag color="red">{seenDate.toLocaleDateString()}</Tag>;
  };

  const getDiffTag = (diff: number) => {
    if (diff < 0) return <Tag color="red">{diff.toFixed(2)}%</Tag>;
    if (diff <= 1) return <Tag color="gold">{diff.toFixed(2)}%</Tag>;
    if (diff <= 3) return <Tag color="green">{diff.toFixed(2)}%</Tag>;
    return <Tag>{diff.toFixed(2)}%</Tag>;
  };

  // 🔹 Ant Design Table Columns
  const columns: ColumnsType<any> = [
    {
      title: "Symbol",
      dataIndex: "ticker",
      render: (_: any, row: any) => (
        <Button
          type="link"
          onClick={() => handleSymbolClick(row)}
          style={{ padding: 0, fontWeight: 600 }}
        >
          {row.ticker}
          <div style={{ fontSize: 12 }}>{getLastSeenLabel(row.last_seen)}</div>
        </Button>
      ),
    },
    { title: "Timeframe", dataIndex: "timeframes", responsive: ["md"] },
    { title: "Pattern", dataIndex: "pattern", responsive: ["md"] },
    {
      title: "Proximal Line",
      dataIndex: "proximal_line",
      render: (val: any) => formatNumber(val),
      responsive: ["lg"],
    },
    {
      title: "Distal Line",
      dataIndex: "distal_line",
      render: (val: any) => formatNumber(val),
      responsive: ["lg"],
    },
    { title: "Freshness", dataIndex: "freshness", responsive: ["md"] },
    { title: "Trade Score", dataIndex: "trade_score", responsive: ["lg"] },
    { title: "Base Candles", dataIndex: "base_candles", responsive: ["lg"] },
    {
      title: "LTP",
      render: (_: any, row: any) => {
        const ltp = row.symbol_data?.ltp;
        const proximal = row.proximal_line;
        if (!ltp || !proximal) return "-";

        const diff = ((ltp - proximal) / proximal) * 100;
        return (
          <Space direction="vertical" size={0}>
            <span>{formatNumber(ltp)}</span>
            {getDiffTag(diff)}
          </Space>
        );
      },
      responsive: ["md"],
    },
    {
      title: "Day Low",
      render: (_: any, row: any) => {
        const dayLow = row.symbol_data?.day_low;
        const proximal = row.proximal_line;
        if (!dayLow || !proximal) return "-";

        const diff = ((dayLow - proximal) / proximal) * 100;
        return (
          <Space direction="vertical" size={0}>
            <span>{formatNumber(dayLow)}</span>
            {getDiffTag(diff)}
          </Space>
        );
      },
      responsive: ["lg"],
    },
    {
      title: "Actions",
      render: (_: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} />
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Space>
      ),
      responsive: ["md"],
    },
  ];

  return (
    <Card style={{ padding: 24 }}>
      <Title level={3} style={{ marginBottom: 16 }}>
        📈 Demand Zones
      </Title>

      {/* 🔹 Filters */}
      {/* 🔹 Filters */}
<Card size="small" style={{ marginBottom: 16, background: "#fafafa" }}>
  {screens.md ? (
    // Desktop → inline filters
    <Space>
      <InputNumber
        value={proximalWithin}
        min={0}
        max={100}
        onChange={(val) => setProximalWithin(val ?? 0)}
        addonAfter="%"
      />
      <Select
        value={compareTo}
        onChange={(val) => setCompareTo(val)}
        options={[
          { value: "ltp", label: "LTP" },
          { value: "day_low", label: "Day Low" },
        ]}
        style={{ width: 120 }}
      />
      <Button
        type="primary"
        icon={<FilterOutlined />}
        onClick={() => setUseFilters(true)}
      >
        Apply
      </Button>
      <Button
        icon={<ReloadOutlined />}
        onClick={() => setUseFilters(false)}
      >
        Reset
      </Button>
    </Space>
  ) : (
    // Mobile → stacked filters
    <Space direction="vertical" style={{ width: "100%" }}>
      <InputNumber
        value={proximalWithin}
        min={0}
        max={100}
        onChange={(val) => setProximalWithin(val ?? 0)}
        addonAfter="%"
        style={{ width: "100%" }}
      />
      <Select
        value={compareTo}
        onChange={(val) => setCompareTo(val)}
        options={[
          { value: "ltp", label: "LTP" },
          { value: "day_low", label: "Day Low" },
        ]}
        style={{ width: "100%" }}
      />
      <Button
        type="primary"
        block
        icon={<FilterOutlined />}
        onClick={() => setUseFilters(true)}
      >
        Apply
      </Button>
      <Button
        block
        icon={<ReloadOutlined />}
        onClick={() => setUseFilters(false)}
      >
        Reset
      </Button>
    </Space>
  )}
</Card>


      {/* 🔹 Desktop = Table | Mobile = Card List */}
      {screens.md ? (
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={zones}
          pagination={{
            current: page,
            pageSize: rowsPerPage,
            total,
            showSizeChanger: true,
            onChange: (p, pageSize) => {
              setPage(p);
              setRowsPerPage(pageSize);
            },
          }}
          bordered
          scroll={{ x: "max-content" }} // 🔹 enables horizontal scroll
        />
      ) : (
        <List
          dataSource={zones}
          pagination={{
            current: page,
            pageSize: rowsPerPage,
            total,
            onChange: (p) => setPage(p),
          }}
          renderItem={(item) => (
            <Card style={{ marginBottom: 12 }}>
              <b>{item.ticker}</b> {getLastSeenLabel(item.last_seen)}
              <Divider />
              <p>⏱ Timeframe: {item.timeframes}</p>
              <p>📊 Pattern: {item.pattern}</p>
              <p>🔼 Proximal: {formatNumber(item.proximal_line)}</p>
              <p>🔽 Distal: {formatNumber(item.distal_line)}</p>
              <p>🔥 Freshness: {item.freshness}</p>
              <p>⭐ Trade Score: {item.trade_score}</p>
              <p>📉 Base Candles: {item.base_candles}</p>
              <p>💰 LTP: {item.symbol_data?.ltp}</p>
              <p>📉 Day Low: {item.symbol_data?.day_low}</p>
            </Card>
          )}
        />
      )}
    </Card>
  );
}
