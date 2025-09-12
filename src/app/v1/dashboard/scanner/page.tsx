"use client";
import React, { useState } from "react";
import {
  Select,
  Button,
  Table,
  Space,
  Tag,
  Typography,
  Drawer,
  Descriptions,
  Spin,
  Alert,
  Grid,
} from "antd";
import { StarFilled, CopyOutlined } from "@ant-design/icons";
import { useScanner } from "@/hooks/useScanner";
import styles from "./scanner.module.css";
import {useCopyToClipboard} from "@/hooks/useCopyToClipboard";

const { Title } = Typography;
const { useBreakpoint } = Grid;

export default function ScannerPage() {
  const {
    filteredZones,
    timeframe,
    setTimeframe,
    zoneFilter,
    setZoneFilter,
    teamFilter,
    setTeamFilter,
    isLoading,
    error,
  } = useScanner();

  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = useBreakpoint();

  const { copy, contextHolder } = useCopyToClipboard();

  const columns = [
    {
      title: "Ticker",
      dataIndex: "ticker",
      key: "ticker",
      render: (ticker: string) => <strong>{ticker} 
      <CopyOutlined onClick={() => copy(ticker)} 
      style={{ cursor: "pointer" , color: "#555", marginLeft: "10px" }} /></strong>,
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
      render: (value: number) => value?.toFixed(2),
    },
    {
      title: "Distal Line",
      dataIndex: "distal_line",
      key: "distal_line",
      render: (value: number) => value?.toFixed(2),
    },
    {
      title: "Timeframes",
      dataIndex: "timeframes",
      key: "timeframes",
      render: (frames: string[] = []) =>
        (frames || []).map((f) => <Tag key={f}>{f}</Tag>),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "entered" ? "green" : "blue"}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating: number) => (
        <Tag color={rating >= 8 ? "gold" : "default"}>{rating}/10</Tag>
      ),
    },
  ];

  const handleRowClick = (record: any) => {
    setSelectedZone(record);
    setDrawerOpen(true);
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
            type={teamFilter ? "primary" : "default"}
            block={screens.xs}
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

        {/* Table */}
        {isLoading ? (
          <Spin tip="Loading zones..." fullscreen />
        ) : error ? (
          <Alert type="error" message="Failed to fetch zones" />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <Table
              dataSource={filteredZones}
              columns={columns}
              rowKey="zone_id"
              pagination={false}
              bordered
              rowClassName={styles.clickableRow}
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
              })}
              style={{ minWidth: 600 }} // ✅ ensures scroll works on small screens
            />
          </div>
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
