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
  Pagination,
} from "antd";
import { StarFilled, CopyOutlined } from "@ant-design/icons";
import { useScanner } from "@/hooks/useScanner";
import styles from "./scanner.module.css";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import Reactions from "@/components/ui/Reactions";

import TeamsPickModal from "@/components/scanner/TeamsPickModal";

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
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const screens = useBreakpoint();
  const { copy, contextHolder } = useCopyToClipboard();

  const paginatedZones = filteredZones.slice((page - 1) * pageSize, page * pageSize);

  const [teamsPickOpen, setTeamsPickOpen] = useState(false);

  const teamZones = filteredZones.filter((z: any) => z.isTeamPick); 

  const columns = [
    {
      title: "Ticker",
      dataIndex: "ticker",
      key: "ticker",
      onCell: (record: any) => ({
        onClick: () => handleRowClick(record),
        style: { cursor: "pointer" },
      }),
      render: (ticker: string) => (
        <strong>
          {ticker}
          <CopyOutlined
            onClick={(e) => {
              e.stopPropagation();
              copy(ticker);
            }}
            style={{ cursor: "pointer", color: "#555", marginLeft: "10px" }}
          />
        </strong>
      ),
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
      title: "Actions",
      key: "actions",
      render: (_: any, row: any) => (
        <Reactions
          itemId={row._id}
          type="zone"
          allItemIds={filteredZones.map((zone: any) => zone._id)}
          teamPickEnabled
        />
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
        ) : screens.xs ? (
          // ✅ Mobile view → Cards
          <>
            <div className="space-y-3">
              {paginatedZones.map((zone) => (
                <div
                  key={zone._id}
                  className="p-3 border rounded-md bg-white shadow-sm cursor-pointer hover:shadow-md transition"
                  
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <strong>{zone.ticker}</strong>
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

                  {/* Actions */}
                  <div className="mt-2">
                    <Reactions
                      itemId={zone._id}
                      type="zone"
                      allItemIds={filteredZones.map((z: any) => z._id)}
                      teamPickEnabled
                    />
                  </div>
                </div>
              ))}
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
        ) : (
          // ✅ Desktop view → Table
          <div style={{ overflowX: "auto" }}>
            <Table
              dataSource={filteredZones}
              columns={columns}
              rowKey="zone_id"
              pagination={false}
              bordered
              rowClassName={styles.clickableRow}
              style={{ minWidth: 600 }}
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
