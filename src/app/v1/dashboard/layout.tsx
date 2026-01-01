// app/v1/dashboard/layout.tsx
"use client";

import { Layout, Menu, Grid, Spin, Dropdown, Card, Button, Avatar, Modal } from "antd";
import {
  DashboardOutlined,
  ScanOutlined,
  BarChartOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  AuditOutlined,
  ProfileOutlined,
  CloseOutlined,
  TrophyOutlined
} from "@ant-design/icons";
import Link from "next/link";
import { useState, useEffect } from "react";
import useAuthGuard from "@/hooks/useAuthGuard";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import PlanBadge from "@/components/common/PlanBadge";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { features } from "@/config/features";
import { Stick } from "next/font/google";

import Image from "next/image";
import Sidebar from "@/components/dashboard/Sidebar";
import { usePathname } from "next/navigation";
import ExpiringSoonBanner from "@/components/common/ExpiringSoonBanner";
import OtherChannelsModal from "@/components/common/OtherChannelsModal";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/v1/dashboard", icon: <DashboardOutlined /> },
  { label: "New Setups", href: "/v1/dashboard/latest-zones", icon: <AppstoreOutlined /> },
  { label: "Alerts", href: "/v1/dashboard/alerts", icon: <BellOutlined /> },
  { label: "Scanner", href: "/v1/dashboard/scanner", icon: <ScanOutlined /> },
  { label: "Journal", href: "/v1/dashboard/trades", icon: <BarChartOutlined /> },
  { label: "Reports", href: "/v1/dashboard/reports", icon: <FileTextOutlined /> },
  { label: "Users", href: "/v1/dashboard/users", icon: <UserOutlined /> },
  { label: "Exclusive", href: "/v1/dashboard/exclusive", icon: <TrophyOutlined /> },
  { label: "Activity Log", href: "/v1/dashboard/activity-logs", icon: <AuditOutlined /> },
  { label: "Zones", href: "/v1/dashboard/demand-zones", icon: <AppstoreOutlined /> },
  // { label: "Notifications", href: "/v1/dashboard/notifications", icon: <BellOutlined /> },
  // { label: "Settings", href: "/v1/dashboard/settings", icon: <SettingOutlined /> },
  { label: "Profile", href: "/v1/dashboard/profile", icon: <ProfileOutlined /> },
];


// Map routes to feature keys for access control
const routeFeatureMap: Record<string, keyof typeof features | null> = {
  "/v1/dashboard": null,
  "/v1/dashboard/latest-zones": "latestZones",
  "/v1/dashboard/alerts": "alerts",
  "/v1/dashboard/scanner": "scanner",
  "/v1/dashboard/trades": "journal",
  "/v1/dashboard/reports": "zonesReport",
  "/v1/dashboard/exclusive": "exclusive",
  "/v1/dashboard/demand-zones": "allZoneList",
  // "/v1/dashboard/notifications": null,
  "/v1/dashboard/users": "users",
  "/v1/dashboard/activity-logs": "activityLog",
  "/v1/dashboard/billing": null,
  "/v1/dashboard/settings": null,
  "/v1/dashboard/profile": null,
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const screens = useBreakpoint();
  const { user, loading } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const [showExpiryBanner, setShowExpiryBanner] = useState(true);

  const pathname = usePathname();

  // Telegram modal state
  const [telegramModalVisible, setTelegramModalVisible] = useState(false);

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.replace("/v1/login");
    }
  }, [loading, user, router]);

  // Check for Telegram username on user load
  useEffect(() => {
    if (user) {
      const hasTelegram = user?.other_channels?.some((ch: any) => ch.channel === "telegramUsername");
      if (!hasTelegram) {
        setTelegramModalVisible(true);
      }
    }
  }, [user]);

  // handle logout click
  const handleLogout = async () => {
    await logout();
    router.replace("/v1/login");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  // Subscription display helpers
  const sub = user?.subscription;
  let derivedEndDate: Date | null = null;
  if (sub?.endDate) {
    derivedEndDate = new Date(sub.endDate);
  } else if (sub?.startDate && sub?.billingCycle) {
    const start = new Date(sub.startDate);
    const d = new Date(start);
    if (sub.billingCycle === "daily") d.setDate(d.getDate() + 2);
    else if (sub.billingCycle === "weekly") d.setDate(d.getDate() + 7);
    else if (sub.billingCycle === "monthly") d.setMonth(d.getMonth() + 1);
    else if (sub.billingCycle === "quarterly") d.setMonth(d.getMonth() + 3);
    else if (sub.billingCycle === "yearly") d.setFullYear(d.getFullYear() + 1);
    derivedEndDate = d;
  }
  const expiryText = derivedEndDate ? derivedEndDate.toLocaleDateString() : "—";
  const cycleText = sub?.billingCycle ? sub.billingCycle : "—";

  const userCard = (
    <Card style={{ width: 240 }} bodyStyle={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <Avatar size={40} icon={<UserOutlined />} />
        <div style={{ marginLeft: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontWeight: 600 }}>{user?.name}</div>
            <PlanBadge plan={user?.subscription?.plan || "freemium"} />
          </div>
          <div style={{ fontSize: 12, color: "#888" }}>{user?.email}</div>
        </div>
      </div>
      <div style={{ fontSize: 13, marginBottom: 12 }}>
        Role: <b>{user?.roles?.[0] || "user"}</b>
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: "#555", marginBottom: 12, lineHeight: 1.5 }}>
          <div>
            Plan: <b style={{ textTransform: "capitalize" }}>{sub.plan || "freemium"}</b>
          </div>
          <div>
            Status: <b style={{ textTransform: "capitalize" }}>{sub.status || "inactive"}</b>
          </div>
          <div>
            Cycle: <b style={{ textTransform: "capitalize" }}>{cycleText}</b>
          </div>
          <div>
            Expires: <b>{expiryText}</b>
          </div>
        </div>
      )}
      <Button
        type="text"
        icon={<LogoutOutlined />}
        danger
        block
        onClick={handleLogout}
      >
        Logout
      </Button>
    </Card>
  );

  // Expiry logic
  const today = new Date();
  let isExpiringSoon = false;
  let daysLeft: number | null = null;
  if (derivedEndDate) {
    const diffTime = derivedEndDate.getTime() - today.getTime();
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    isExpiringSoon = daysLeft > 0 && daysLeft <= 2; // show warning if ≤ 2 days
  }

  const isExpired =
    sub?.status !== "active" || (derivedEndDate && derivedEndDate < new Date());

  const shouldBlock = isExpired && pathname !== "/v1/dashboard/profile"
    && pathname !== "/v1/dashboard/billing" && pathname !== "/v1/dashboard"
    && pathname !== "/v1/dashboard/alerts";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar navItems={navItems} routeFeatureMap={routeFeatureMap} user={user}
        collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Area */}
      <Layout>
        <Header
          style={{
            padding: "0 16px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0f0f0",
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {collapsed ? (
              <MenuUnfoldOutlined
                onClick={() => setCollapsed(false)}
                style={{ fontSize: 18, cursor: "pointer" }}
              />
            ) : (
              <MenuFoldOutlined
                onClick={() => setCollapsed(true)}
                style={{ fontSize: 18, cursor: "pointer" }}
              />
            )}
            <h1 style={{ marginLeft: 16, fontSize: 18 }}>Dashboard</h1>
          </div>

          {/* Expiring soon banner */}
          {isExpiringSoon && (
            <ExpiringSoonBanner derivedEndDate={derivedEndDate} daysLeft={daysLeft} />
          )}


          {/* {user && (
            <Dropdown overlay={userCard} trigger={["click"]} placement="bottomRight" arrow>
              <div style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 8 }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <span>{user.name}</span>
                <PlanBadge plan={user?.subscription?.plan || "freemium"} />
              </div>
            </Dropdown>
          )} */}

          {user && !screens.xs && (
            <Dropdown
              trigger={["click"]}
              placement="bottomRight"
              arrow
              menu={{
                items: [
                  {
                    key: "user-card",
                    label: userCard,
                  },
                ],
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  gap: 8,
                }}
              >
                <Avatar size="small" icon={<UserOutlined />} />
                <span>{user.name}</span>
                <PlanBadge plan={user?.subscription?.plan || "freemium"} />
              </div>
            </Dropdown>
          )}
        </Header>

        <Content
          style={{
            margin: screens.xs ? "12px" : "24px 16px",
            padding: screens.xs ? 12 : 24,
            background: "#fff",
            borderRadius: 8,
            minHeight: "calc(100vh - 112px)", // adjust for header
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Blurred children only if expired */}
          <div
            style={{
              filter: shouldBlock ? "blur(6px)" : "none",
              pointerEvents: shouldBlock ? "none" : "auto",
              userSelect: shouldBlock ? "none" : "auto",
              overflow: "hidden",
            }}
          >
            {children}
          </div>

          {/* Show popup only if expired */}
          {shouldBlock && (
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 24,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                zIndex: 1000,
                minWidth: 300,
                textAlign: "center",
              }}
            >
              <h3 style={{ marginBottom: 12 }}>No active subscription found</h3>
              <p style={{ marginBottom: 16 }}>
                Join or renew to dive into Autozonex’s premium demand-supply tools!
              </p>
              <Button
                type="primary"
                size="large"
                onClick={() => router.push("/v1/dashboard/billing")}
              >
                Renew Subscription
              </Button>
            </div>
          )}
        </Content>
      </Layout>

      {/* Telegram Username Modal */}
      <OtherChannelsModal
        visible={telegramModalVisible}
        onClose={() => setTelegramModalVisible(false)}
        channel="telegramUsername"
        title="Add Your Telegram Username"
        description="Add your Telegram username for easy support and seamless services, like automatically adding you to our alerts group."
        placeholder="Enter your Telegram username (without @)"
        onSuccess={() => {
          router.refresh();
          setTelegramModalVisible(false);
        }}
      />
    </Layout>
  );
}