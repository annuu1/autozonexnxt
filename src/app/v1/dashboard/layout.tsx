// app/v1/dashboard/layout.tsx
"use client";

import { Layout, Menu, Grid, Spin } from "antd";
import {
  DashboardOutlined,
  BarChartOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useState } from "react";
import useAuthGuard from "@/hooks/useAuthGuard";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/v1/dashboard", icon: <DashboardOutlined /> },
  { label: "Trades", href: "/v1/dashboard/trades", icon: <BarChartOutlined /> },
  { label: "Reports", href: "/v1/dashboard/reports", icon: <FileTextOutlined /> },
  { label: "Zones", href: "/v1/dashboard/demand-zones", icon: <AppstoreOutlined /> },
  { label: "Notifications", href: "/v1/dashboard/notifications", icon: <BellOutlined /> },
  { label: "Settings", href: "/v1/dashboard/settings", icon: <SettingOutlined /> },
  { label: "Profile", href: "/v1/dashboard/profile", icon: <UserOutlined /> },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const screens = useBreakpoint();
  const { user, loading } = useAuthGuard();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh"}}>
      {/* Sidebar */}
      <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          breakpoint="lg"
          collapsedWidth={screens.xs ? 0 : 80}
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
            }}
          >
            {/* If collapsed, show only icon */}
            {collapsed ? (
              <span style={{ fontSize: 24 }}>📈</span>
            ) : (
              <>
                <span style={{ marginRight: 8, fontSize: 24 }}>📈</span>
                AutoZone
              </>
            )}
          </div>

        <Menu theme="dark" mode="inline" selectedKeys={[]}>
          {navItems.map((item) => (
            <Menu.Item key={item.href} icon={item.icon}>
              <Link href={item.href}>{item.label}</Link>
            </Menu.Item>
          ))}
        </Menu>
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
          {user && (
            <div style={{ fontSize: 13, color: "#555" }}>
              {user.name} · {user.roles?.[0] || "user"}
            </div>
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
