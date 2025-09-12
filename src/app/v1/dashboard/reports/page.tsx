"use client"

import React from "react"
import {
  Tabs,
  Table,
  Card,
  Typography,
  Divider,
  Spin,
  Alert,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import { useReports } from "@/hooks/useReports"

const { Title } = Typography

const todayColumns: Record<string, ColumnsType<any>> = {
  approaching: [
    { title: "Zone ID", dataIndex: "id" },
    { title: "Price Range", dataIndex: "range" },
    { title: "Time Detected", dataIndex: "time" },
    { title: "Strength", dataIndex: "strength" },
  ],
  entered: [
    { title: "Zone ID", dataIndex: "id" },
    { title: "Price Range", dataIndex: "range" },
    { title: "Entry Time", dataIndex: "time" },
    { title: "Holding?", dataIndex: "holding" },
  ],
  breached: [
    { title: "Zone ID", dataIndex: "id" },
    { title: "Price Range", dataIndex: "range" },
    { title: "Breach Time", dataIndex: "time" },
    { title: "Reaction", dataIndex: "reaction" },
  ],
}

const daywiseColumns: Record<string, ColumnsType<any>> = {
  approaching: [
    { title: "Zone ID", dataIndex: "id" },
    { title: "Price Range", dataIndex: "range" },
    { title: "Time Detected", dataIndex: "time" },
    { title: "Notes", dataIndex: "notes" },
  ],
  entered: [
    { title: "Zone ID", dataIndex: "id" },
    { title: "Price Range", dataIndex: "range" },
    { title: "Entry Time", dataIndex: "time" },
    { title: "Notes", dataIndex: "notes" },
  ],
  breached: [
    { title: "Zone ID", dataIndex: "id" },
    { title: "Price Range", dataIndex: "range" },
    { title: "Entry Time", dataIndex: "entry" },
    { title: "Breach Time", dataIndex: "time" },
  ],
}

function ReportsPage() {
  const { data, isLoading, error } = useReports()

  if (isLoading) {
    return (
      <div style={{ padding: 16, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <Alert
          type="error"
          message="Error"
          description={(error as Error).message}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        padding: 16,
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      <Title
        level={3}
        style={{
          fontSize: "clamp(18px, 4vw, 24px)",
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        📊 Demand Zone Reports
      </Title>

      {/* Today Section */}
      <Card
        title="Today’s Demand Zones"
        style={{ marginBottom: 24 }}
        bodyStyle={{ padding: 12 }}
      >
        <Tabs
          tabPosition="top"
          items={[
            {
              key: "approaching",
              label: "Approaching",
              children: (
                <Table
                  dataSource={data?.today.approaching}
                  columns={todayColumns.approaching}
                  rowKey="id"
                  pagination={false}
                  scroll={{ x: true }}
                  size="small"
                />
              ),
            },
            {
              key: "entered",
              label: "Entered",
              children: (
                <Table
                  dataSource={data?.today.entered}
                  columns={todayColumns.entered}
                  rowKey="id"
                  pagination={false}
                  scroll={{ x: true }}
                  size="small"
                />
              ),
            },
            {
              key: "breached",
              label: "Breached",
              children: (
                <Table
                  dataSource={data?.today.breached}
                  columns={todayColumns.breached}
                  rowKey="id"
                  pagination={false}
                  scroll={{ x: true }}
                  size="small"
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Daywise Section */}
      <Card title="Daywise History" bodyStyle={{ padding: 12 }}>
        {Object.entries(data?.history || {}).map(([date, statuses]) => (
          <div key={date} style={{ marginBottom: 24 }}>
            <Divider
              orientation="left"
              style={{
                fontSize: "clamp(14px, 3vw, 18px)",
                margin: "12px 0",
              }}
            >
              {date}
            </Divider>
            <Tabs
              tabPosition="top"
              items={Object.entries(statuses).map(([status, rows]) => ({
                key: status,
                label: status.charAt(0).toUpperCase() + status.slice(1),
                children: (
                  <Table
                    dataSource={rows}
                    columns={daywiseColumns[status]}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: true }}
                    size="small"
                  />
                ),
              }))}
            />
          </div>
        ))}
      </Card>
    </div>
  )
}

export default ReportsPage
