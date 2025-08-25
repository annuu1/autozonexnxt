"use client";
import { Card } from "antd";

export default function StatCard({
  title,
  value,
  icon,
  gradient,
  loading,
  onClick,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  loading: boolean;
  onClick?: () => void;
}) {
  return (
    <Card
      style={{
        background: gradient,
        color: "#fff",
        borderRadius: 8,
        cursor: onClick ? "pointer" : "default",
      }}
      bordered={false}
      loading={loading}
      onClick={onClick}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {icon}
        <div style={{ marginLeft: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 500 }}>{title}</div>
          <div style={{ fontSize: 24, fontWeight: "bold" }}>{value}</div>
        </div>
      </div>
    </Card>
  );
}
