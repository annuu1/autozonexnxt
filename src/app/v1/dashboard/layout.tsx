// app/v1/dashboard/layout.tsx
"use client";

import { Layout, Menu, Grid, Spin, Dropdown, Card, Button, Avatar } from "antd";
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
} from "@ant-design/icons";
import Link from "next/link";
import { useState } from "react";
import useAuthGuard from "@/hooks/useAuthGuard";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import PlanBadge from "@/components/common/PlanBadge";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { features } from "@/config/features";
import { Stick } from "next/font/google";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/v1/dashboard", icon: <DashboardOutlined /> },
  { label : "Scanner", href: "/v1/dashboard/scanner", icon: <ScanOutlined />},
  { label: "Trades", href: "/v1/dashboard/trades", icon: <BarChartOutlined /> },
  { label: "Reports", href: "/v1/dashboard/reports", icon: <FileTextOutlined /> },
  { label: "Users", href: "/v1/dashboard/users", icon: <UserOutlined /> },
  { label: "Activity Log", href: "/v1/dashboard/activity-logs", icon: <AuditOutlined /> },
  { label: "Zones", href: "/v1/dashboard/demand-zones", icon: <AppstoreOutlined /> },
  { label: "Notifications", href: "/v1/dashboard/notifications", icon: <BellOutlined /> },
  { label: "Settings", href: "/v1/dashboard/settings", icon: <SettingOutlined /> },
  { label: "Profile", href: "/v1/dashboard/profile", icon: <ProfileOutlined /> },
];


// Map routes to feature keys for access control
const routeFeatureMap: Record<string, keyof typeof features | null> = {
  "/v1/dashboard": null,
  "/v1/dashboard/trades": "trades",
  "/v1/dashboard/reports": "zonesReport",
  "/v1/dashboard/demand-zones": "allZoneList",
  "/v1/dashboard/notifications": "notifications",
  "/v1/dashboard/users": "users",
  "/v1/dashboard/activity-logs": "activityLog",
  "/v1/dashboard/billing": null,
  "/v1/dashboard/settings": null,
  "/v1/dashboard/profile": null,
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const screens = useBreakpoint();
  const { user, loading } = useAuthGuard();
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

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
    if (sub.billingCycle === "monthly") d.setMonth(d.getMonth() + 1);
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

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        breakpoint="lg"
        collapsedWidth={screens.xs ? 0 : 80}
        trigger={null}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            margin: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            color: "#fff",
            fontWeight: "bold",
            fontSize: collapsed ? 20 : 22,
            letterSpacing: 1,
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          {collapsed ? <span style={{ fontSize: 24 }}>📈</span> : <>
            <span style={{ marginRight: 8, fontSize: 24 }}>📈</span>
            AutoZone
          </>}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[]}
          items={navItems.map((item) => {
            const fkey = routeFeatureMap[item.href];
            let hidden = false;
            if (fkey) {
              const { allowed } = useFeatureAccess(fkey, user);
              hidden = !allowed;
            }
            return {
              key: item.href,
              icon: item.icon,
              label: <Link href={item.href}>{item.label}</Link>,
              hidden,
            };
          })}
          onClick={() => {
            // auto collapse if on mobile
            if (screens.xs) {
              setCollapsed(true);
            }
          }}
          style={{ position: "sticky", top: 64, zIndex: 1 }}
        />

      </Sider>

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
                      label: userCard, // the custom card you already built
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
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
