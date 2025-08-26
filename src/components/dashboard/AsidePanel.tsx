"use client";

import { Card, List } from "antd";

interface AsidePanelProps {
  marketSummary: { label: string; value: string; trend: "up" | "down" | "flat" }[];
  alerts: string[];
  notifications: string[];
}

export default function AsidePanel({ marketSummary, alerts, notifications }: AsidePanelProps) {
  return (
    <>
      {/* Market Summary */}
      <Card title="📌 Market Summary" style={{ marginBottom: 20 }}>
        {marketSummary.map((item, idx) => (
          <p key={idx}>
            {item.trend === "up" && "✅ "}
            {item.trend === "down" && "📉 "}
            {item.trend === "flat" && "➖ "}
            {item.label}: {item.value}
          </p>
        ))}
      </Card>

      {/* Alerts */}
      <Card title="⚠️ Alerts" style={{ marginBottom: 20 }}>
        <List
          dataSource={alerts}
          renderItem={(item) => <List.Item>{item}</List.Item>}
        />
      </Card>

      {/* Notifications */}
      <Card title="🔔 Notifications">
        <List
          dataSource={notifications}
          renderItem={(item) => <List.Item>{item}</List.Item>}
        />
      </Card>
    </>
  );
}
