import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Layout, Menu } from "antd";
import Link from "next/link";
import type { ReactNode } from "react";

const { Sider, Content, Header } = Layout;

export default async function AdminLayout({ children }: { children: ReactNode }) {

  return (
     <div>
        {children}
     </div>
  );
}
