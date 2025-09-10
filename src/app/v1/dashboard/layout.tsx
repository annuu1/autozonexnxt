// app/v1/dashboard/layout.tsx
"use client";

import { Layout, Menu, Grid, Spin, Dropdown, Card, Button, Avatar } from "antd";
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
  LogoutOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useState } from "react";
import useAuthGuard from "@/hooks/useAuthGuard";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

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

  const userCard = (
    <Card style={{ width: 240 }} bodyStyle={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <Avatar size={40} icon={<UserOutlined />} />
        <div style={{ marginLeft: 12 }}>
          <div style={{ fontWeight: 600 }}>{user?.name}</div>
          <div style={{ fontSize: 12, color: "#888" }}>{user?.email}</div>
        </div>
      </div>
      <div style={{ fontSize: 13, marginBottom: 12 }}>
        Role: <b>{user?.roles?.[0] || "user"}</b>
      </div>
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
          {collapsed ? <span style={{ fontSize: 24 }}>📈</span> : <>
            <span style={{ marginRight: 8, fontSize: 24 }}>📈</span>
            AutoZone
          </>}
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
            <Dropdown overlay={userCard} trigger={["click"]} placement="bottomRight" arrow>
              <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <span style={{ marginLeft: 8 }}>{user.name}</span>
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
