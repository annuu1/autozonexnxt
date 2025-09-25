// components/dashboard/ExpiringSoonBanner.tsx
"use client";

import { Button, Grid } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useRouter } from "next/navigation";

type ExpiringSoonBannerProps = {
  derivedEndDate: Date | null;
  daysLeft: number | null;
};

const { useBreakpoint } = Grid;

export default function ExpiringSoonBanner({ derivedEndDate, daysLeft }: ExpiringSoonBannerProps) {
  const [visible, setVisible] = useState(true);
  const router = useRouter();
  const screens = useBreakpoint();

  if (!visible || !derivedEndDate || daysLeft === null) return null;

  const expiryDateText = derivedEndDate.toLocaleDateString();
  const plural = daysLeft !== 1 ? "s" : "";

  // Desktop text
  const desktopText = (
    <>
      ⚠️ Your plan is expiring on <b>{expiryDateText}</b> ({daysLeft} day{plural} left).
    </>
  );

  // Mobile text
  const mobileText = (
    <>
      ⚠️ Plan expires <b>{expiryDateText}</b> ({daysLeft}d left)
    </>
  );

  return (
    <div
      style={{
        background: "#fff3cd",
        color: "#856404",
        border: "1px solid #ffeeba",
        padding: "8px 12px",
        borderRadius: 4,
        fontSize: 13,
        display: "flex",
        flexDirection: screens.xs ? "row" : "row",
        alignItems: screens.xs ? "flex-start" : "center",
        justifyContent: "space-between",
        gap: 8,
        width: screens.xs ? "90%" : "auto",
        maxWidth: "100%",
        position: "fixed",
        top: 0,
        right: "50%",
        transform: "translateX(50%)",
        zIndex: 1000,
      }}
    >
      <div>{screens.xs ? mobileText : desktopText}</div>
      <div style={{ display: "flex", flexWrap: "nowrap", alignItems: "center", gap: 8 }}>
        <Button
          type="link"
          size="small"
          style={{ padding: 0 }}
          onClick={() => {setVisible(false); router.push("/v1/dashboard/billing")}}
        >
          Renew
        </Button>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={() => setVisible(false)}
          style={{
            color: "#856404",
            padding: 0,
            height: "auto",
          }}
        />
      </div>
    </div>
  );
}
