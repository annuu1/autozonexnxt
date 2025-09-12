"use client";
import React, { useState } from "react";
import { Select, Button, Table, Card, Space, Tag, Typography, Drawer, Descriptions } from "antd";
import { StarFilled } from "@ant-design/icons";
import styles from "./scanner.module.css"; // <- we will create this CSS module

const { Option } = Select;
const { Title } = Typography;

export default function ScannerPage() {
  const [timeframe, setTimeframe] = useState("all");
  const [zoneFilter, setZoneFilter] = useState(null);
  const [teamFilter, setTeamFilter] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Static sample data
  const zones = [
    {
      key: "1",
      ticker: "AUBANK",
      pattern: "RBR",
      proximal_line: 768.6,
      distal_line: 750.25,
      timeframes: ["1wk", "1d"],
      status: "approaching",
      trade_score: 0,
      rating: 9,
      zone_id: "AUBANK-1wk-2025-06-16T00:00:00+05:30",
      freshness: 0,
      timestamp: "2025-06-02T00:00:00+05:30",
    },
    {
      key: "2",
      ticker: "RELIANCE",
      pattern: "DBD",
      proximal_line: 2540.5,
      distal_line: 2501.25,
      timeframes: ["1mo"],
      status: "entered",
      trade_score: 5,
      rating: 7,
      zone_id: "RELIANCE-1mo-2025-05-20T00:00:00+05:30",
      freshness: 1,
      timestamp: "2025-05-05T00:00:00+05:30",
    },
  ];

  const filteredZones = zones.filter((zone) => {
    if (timeframe !== "all" && !zone.timeframes.includes(timeframe)) return false;
    if (zoneFilter && zone.status !== zoneFilter) return false;
    if (teamFilter && zone.rating < 8) return false;
    return true;
  });

  const columns = [
    {
      title: "Ticker",
      dataIndex: "ticker",
      key: "ticker",
      render: (ticker) => <strong>{ticker}</strong>,
    },
    {
      title: "Pattern",
      dataIndex: "pattern",
      key: "pattern",
    },
    {
      title: "Proximal Line",
      dataIndex: "proximal_line",
      key: "proximal_line",
      render: (value) => value.toFixed(2),
    },
    {
      title: "Distal Line",
      dataIndex: "distal_line",
      key: "distal_line",
      render: (value) => value.toFixed(2),
    },
    {
      title: "Timeframes",
      dataIndex: "timeframes",
      key: "timeframes",
      render: (frames) => frames.map((f) => <Tag key={f}>{f}</Tag>),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "entered" ? "green" : "blue"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => (
        <Tag color={rating >= 8 ? "gold" : "default"}>{rating}/10</Tag>
      ),
    },
  ];

  const handleRowClick = (record) => {
    setSelectedZone(record);
    setDrawerOpen(true);
  };

  return (
    <Card style={{ margin: "20px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={3}>Zone Scanner</Title>

        {/* Filters */}
        <Space wrap>
          <Select value={timeframe} onChange={setTimeframe} style={{ width: 150 }}>
            <Option value="all">All</Option>
            <Option value="1wk">1 Week</Option>
            <Option value="1mo">1 Month</Option>
            <Option value="3mo">3 Months</Option>
          </Select>

          <Button
            type={zoneFilter === "approaching" ? "primary" : "default"}
            onClick={() =>
              setZoneFilter(zoneFilter === "approaching" ? null : "approaching")
            }
          >
            Approaching
          </Button>

          <Button
            type={zoneFilter === "entered" ? "primary" : "default"}
            onClick={() =>
              setZoneFilter(zoneFilter === "entered" ? null : "entered")
            }
          >
            Entered
          </Button>

          <Button
            type={teamFilter ? "primary" : "default"}
            style={{
              backgroundColor: teamFilter ? "#fadb14" : "#fffbe6",
              borderColor: "#d4b106",
              fontWeight: "bold",
              boxShadow: teamFilter
                ? "0px 0px 10px rgba(250, 219, 20, 0.8)"
                : "none",
            }}
            icon={<StarFilled style={{ color: "#faad14" }} />}
            onClick={() => setTeamFilter(!teamFilter)}
          >
            Team’s Pick
          </Button>
        </Space>

        {/* Results Table */}
        <Table
          dataSource={filteredZones}
          columns={columns}
          pagination={false}
          bordered
          rowClassName={styles.clickableRow}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
        />

        {/* Drawer for Zone Details */}
        <Drawer
          title={`Zone Details: ${selectedZone?.ticker || ""}`}
          placement="right"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          width={400}
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
    </Card>
  );
}
