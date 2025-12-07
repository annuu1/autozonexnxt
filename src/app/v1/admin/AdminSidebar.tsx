'use client';

import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
    UserOutlined,
    SettingOutlined,
    DashboardOutlined,
    StockOutlined,
    DollarOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const { Sider, Content, Header } = Layout;

export default function AdminSidebar({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const items = [
        {
            key: '/v1/admin',
            icon: <DashboardOutlined />,
            label: <Link href="/v1/admin">Dashboard</Link>,
        },
        {
            key: '/v1/admin/users',
            icon: <UserOutlined />,
            label: <Link href="/v1/admin/users">Users</Link>,
        },
        {
            key: '/v1/admin/symbols',
            icon: <StockOutlined />,
            label: <Link href="/v1/admin/symbols">Symbols</Link>,
        },
        {
            key: '/v1/admin/configs',
            icon: <SettingOutlined />,
            label: <Link href="/v1/admin/configs">Configs</Link>,
        },
        {
            key: '/v1/admin/subscriptions',
            icon: <DollarOutlined />,
            label: <Link href="/v1/admin/subscriptions">Subscriptions</Link>,
        },
    ];

    // Determine selected key
    const selectedKey = items.find(item => pathname === item.key || pathname.startsWith(item.key + '/'))?.key || '/v1/admin';

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />
                <Menu theme="dark" defaultSelectedKeys={[selectedKey]} selectedKeys={[selectedKey]} mode="inline" items={items} />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }} />
                <Content style={{ margin: '0 16px' }}>
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                            marginTop: 16
                        }}
                    >
                        {children}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}
