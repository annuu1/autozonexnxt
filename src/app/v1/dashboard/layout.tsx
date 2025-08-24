// app/v1/dashboard/layout.tsx
"use client";

import { Layout, Menu } from "antd";
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

const { Header, Sider, Content } = Layout;

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

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        breakpoint="lg"
      >
        <div
          style={{
            height: 64,
            margin: 16,
            background: "rgba(255, 255, 255, 0.2)",
          }}
        />

        <Menu theme="dark" mode="inline">
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
          }}
        >
          {collapsed ? (
            <MenuUnfoldOutlined
              onClick={() => setCollapsed(false)}
              style={{ fontSize: 18 }}
            />
          ) : (
            <MenuFoldOutlined
              onClick={() => setCollapsed(true)}
              style={{ fontSize: 18 }}
            />
          )}
          <h1 style={{ marginLeft: 16 }}>Dashboard</h1>
        </Header>

        <Content style={{ margin: "24px 16px", padding: 24, background: "#fff" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
