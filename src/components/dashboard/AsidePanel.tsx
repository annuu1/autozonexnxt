"use client";

import { List } from "antd";
import FeatureWrapper from "../wrappers/FeatureWrapper";
import useAuthStore from "@/store/useAuthStore";

interface AsidePanelProps {
  marketSummary: { label: string; value: string; trend: "up" | "down" | "flat" }[];
  alerts: string[];
  notifications: string[];
}

export default function AsidePanel({ marketSummary, alerts, notifications }: AsidePanelProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <>
      {/* Market Summary (wrapped as paid feature) */}
      <FeatureWrapper title="📌 Sectoral Summary" featureKey="marketSummary" user={user}>
        {marketSummary.map((item, idx) => (
          <p key={idx}>
            {item.trend === "up" && "✅ "}
            {item.trend === "down" && "📉 "}
            {item.trend === "flat" && "➖ "}
            {item.label}: {item.value}
          </p>
        ))}
      </FeatureWrapper>

      {/* Alerts (free feature) */}
      <FeatureWrapper title="⚠️ Alerts" featureKey="alerts" user={user}>
        <List
          dataSource={alerts}
          renderItem={(item) => <List.Item>{item}</List.Item>}
        />
      </FeatureWrapper>

      {/* Notifications (free feature) */}
      <FeatureWrapper title="🔔 Notifications" featureKey="notifications" user={user}>
        <List
          dataSource={notifications}
          renderItem={(item) => <List.Item>{item}</List.Item>}
        />
      </FeatureWrapper>
    </>
  );
}

