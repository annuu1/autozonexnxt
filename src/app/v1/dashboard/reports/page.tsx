"use client"; // add this if you are inside the App Router (app/ directory)

import React from "react";
import { Tabs, Table, Card, Typography, Divider } from "antd";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;

const todayData = {
  approaching: [
    { id: "DZ-201", range: "15400–15500", time: "09:45 AM", strength: "Strong" },
    { id: "DZ-203", range: "15150–15200", time: "10:15 AM", strength: "Medium" },
  ],
  entered: [
    { id: "DZ-202", range: "15250–15320", time: "11:15 AM", holding: "Yes" },
  ],
  breached: [
    { id: "DZ-204", range: "15080–15120", time: "01:05 PM", reaction: "Failed" },
  ],
};

const daywiseData = {
  "29 Aug 2025": {
    breached: [
      { id: "DZ-199", range: "15600–15650", entry: "10:30 AM", breach: "11:05 AM" },
    ],
    entered: [
      { id: "DZ-200", range: "15420–15470", entry: "02:15 PM", notes: "Holding" },
    ],
  },
  "28 Aug 2025": {
    approaching: [
      { id: "DZ-197", range: "15500–15550", time: "12:45 PM", notes: "Tested once" },
    ],
    breached: [
      { id: "DZ-198", range: "15350–15400", entry: "01:30 PM", breach: "02:10 PM" },
    ],
  },
};

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
};

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
    { title: "Entry Time", dataIndex: "entry" },
    { title: "Notes", dataIndex: "notes" },
  ],
  breached: [
    { title: "Zone ID", dataIndex: "id" },
    { title: "Price Range", dataIndex: "range" },
    { title: "Entry Time", dataIndex: "entry" },
    { title: "Breach Time", dataIndex: "breach" },
  ],
};

function ReportsPage() {
  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>📊 Demand Zone Reports</Title>

      {/* Today Section */}
      <Card title="Today’s Demand Zones" style={{ marginBottom: 24 }}>
        <Tabs
          items={[
            {
              key: "approaching",
              label: "Approaching",
              children: (
                <Table
                  dataSource={todayData.approaching}
                  columns={todayColumns.approaching}
                  rowKey="id"
                  pagination={false}
                />
              ),
            },
            {
              key: "entered",
              label: "Entered",
              children: (
                <Table
                  dataSource={todayData.entered}
                  columns={todayColumns.entered}
                  rowKey="id"
                  pagination={false}
                />
              ),
            },
            {
              key: "breached",
              label: "Breached",
              children: (
                <Table
                  dataSource={todayData.breached}
                  columns={todayColumns.breached}
                  rowKey="id"
                  pagination={false}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Daywise Section */}
      <Card title="Daywise History">
        {Object.entries(daywiseData).map(([date, statuses]) => (
          <div key={date} style={{ marginBottom: 32 }}>
            <Divider orientation="left">{date}</Divider>
            <Tabs
              items={Object.entries(statuses).map(([status, rows]) => ({
                key: status,
                label: status.charAt(0).toUpperCase() + status.slice(1),
                children: (
                  <Table
                    dataSource={rows}
                    columns={daywiseColumns[status]}
                    rowKey="id"
                    pagination={false}
                  />
                ),
              }))}
            />
          </div>
        ))}
      </Card>
    </div>
  );
}

export default ReportsPage;
