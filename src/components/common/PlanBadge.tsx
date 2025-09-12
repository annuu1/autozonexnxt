"use client";

import React from "react";
import { Tag } from "antd";

type Props = {
  plan?: string | null;
  size?: "small" | "default";
};

const planStyle = (plan?: string | null) => {
  switch ((plan || "freemium").toLowerCase()) {
    case "pro":
      return { color: "#722ed1", bg: "#f9f0ff", text: "PRO" };
    case "starter":
      return { color: "#fa8c16", bg: "#fff7e6", text: "STARTER" };
    default:
      return { color: "#1890ff", bg: "#e6f7ff", text: "FREEMIUM" };
  }
};

export default function PlanBadge({ plan, size = "small" }: Props) {
  const { color, bg, text } = planStyle(plan);
  return (
    <Tag color={bg} style={{ color, borderColor: bg, fontWeight: 600, fontSize: size === "small" ? 10 : 12 }}>
      {text}
    </Tag>
  );
}
