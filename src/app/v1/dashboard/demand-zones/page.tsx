"use client";

import React, { useEffect, useState } from "react";
import { Table, InputNumber, Select, Button, Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

export default function DemandZonesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

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

    if (diffDays === 0) return <Tag color="green">{seenDate.toLocaleDateString()}</Tag>;
    if (diffDays <= 3) return <Tag color="lime">{seenDate.toLocaleDateString()}</Tag>;
    if (diffDays <= 10) return <Tag color="red">{seenDate.toLocaleDateString()}</Tag>;
    return <Tag color="magenta">{seenDate.toLocaleDateString()}</Tag>;
  };

  const getDiffColor = (diff: number) => {
    if (diff < 0) return "red";
    if (diff <= 1) return "gold";
    if (diff <= 3) return "green";
    return "gray";
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
          style={{ padding: 0 }}
        >
          <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
            <strong>{row.ticker}</strong>
            {getLastSeenLabel(row.last_seen)}
          </div>
        </Button>
      ),
    },
    { title: "Timeframe", dataIndex: "timeframes" },
    { title: "Pattern", dataIndex: "pattern" },
    {
      title: "Proximal Line",
      dataIndex: "proximal_line",
      render: (val: any) => formatNumber(val),
    },
    {
      title: "Distal Line",
      dataIndex: "distal_line",
      render: (val: any) => formatNumber(val),
    },
    { title: "Freshness", dataIndex: "freshness" },
    { title: "Trade Score", dataIndex: "trade_score" },
    { title: "Base Candles", dataIndex: "base_candles" },
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
            <span style={{ color: getDiffColor(diff) }}>{diff.toFixed(2)}%</span>
          </Space>
        );
      },
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
            <span style={{ color: getDiffColor(diff) }}>{diff.toFixed(2)}%</span>
          </Space>
        );
      },
    },
    {
      title: "Actions",
      render: (_: any, row: any) => (
        <Space>
          <Button type="link">Edit</Button>
          <Button type="link" danger>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
        Demand Zones
      </h1>

      {/* 🔹 Filters */}
      <Space style={{ marginBottom: 16 }}>
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
        <Button type="primary" onClick={() => setUseFilters(true)}>
          Apply Filters
        </Button>
        <Button onClick={() => setUseFilters(false)}>Clear</Button>
      </Space>

      {/* 🔹 Table with pagination */}
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
      />
    </div>
  );
}
