"use client";

import { Layout, Menu, Grid, Drawer } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { features } from "@/config/features";

const { Sider } = Layout;
const { useBreakpoint } = Grid;

type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

interface SidebarProps {
  navItems: NavItem[];
  routeFeatureMap: Record<string, keyof typeof features | null>;
  user: any;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

export default function Sidebar({
  navItems,
  routeFeatureMap,
  user,
  collapsed,
  setCollapsed,
}: SidebarProps) {
  const screens = useBreakpoint();

  // ✅ Filter nav items before rendering
  const filteredNavItems = navItems.filter((item) => {
    const fkey = routeFeatureMap[item.href];
    if (!fkey) return true;
    const { allowed } = useFeatureAccess(fkey, user);
    return allowed;
  });

  const menu = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[]}
      items={filteredNavItems.map((item) => ({
        key: item.href,
        icon: item.icon,
        label: <Link href={item.href}>{item.label}</Link>,
      }))}
      onClick={() => {
        // close sidebar on mobile after selecting
        if (screens.xs) setCollapsed(true);
      }}
      style={{ marginTop: 8 }}
    />
  );

  // ✅ Use Drawer on mobile (overlay — does NOT resize layout)
  if (screens.xs) {
    return (
      <Drawer
        placement="left"
        closable={false}
        onClose={() => setCollapsed(true)}
        open={!collapsed}
        width={240} // fixed width
        bodyStyle={{ padding: 0, background: "#001529" }}
        style={{ zIndex: 2000 }} // ensure it overlays everything
      >
        <div
          style={{
            height: 64,
            margin: 16,
            display: "flex",
            alignItems: "center",
            color: "#fff",
            fontWeight: "bold",
            fontSize: 22,
          }}
        >
          <Image
            src="/brand_logo.png"
            alt="AutoZone Logo"
            width={40}
            height={40}
            style={{ marginRight: 8, objectFit: "contain" }}
          />
          AutoZone
        </div>
        {menu}
      </Drawer>
    );
  }

  // ✅ Normal Sider for larger screens
  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      breakpoint="lg"
      collapsedWidth={80}
      trigger={null}
    >
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
        {collapsed ? (
          <Image
            src="/brand_logo.png"
            alt="AutoZone Logo"
            width={40}
            height={40}
            style={{ objectFit: "contain" }}
          />
        ) : (
          <>
            <Image
              src="/brand_logo.png"
              alt="AutoZone Logo"
              width={40}
              height={40}
              style={{ marginRight: 8, objectFit: "contain" }}
            />
            AutoZone
          </>
        )}
      </div>
      {menu}
    </Sider>
  );
}
