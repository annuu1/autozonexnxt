'use client';

import { Card, Col, Row, Statistic, Typography } from 'antd';
import { UserOutlined, StockOutlined, SettingOutlined, DollarOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

export default function AdminDashboard() {
  return (
    <div>
      <Title level={2}>Admin Dashboard</Title>
      <Paragraph>
        Welcome to the AutoZoneX NXT Administration Panel. Manage users, symbols, configurations, and subscriptions from here.
      </Paragraph>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Link href="/v1/admin/users">
            <Card hoverable>
              <Statistic
                title="Manage Users"
                value="Users"
                prefix={<UserOutlined />}
                valueStyle={{ fontSize: 16 }}
              />
              <div style={{ marginTop: 8, color: '#888' }}>View and manage user accounts</div>
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Link href="/v1/admin/symbols">
            <Card hoverable>
              <Statistic
                title="Manage Symbols"
                value="Symbols"
                prefix={<StockOutlined />}
                valueStyle={{ fontSize: 16 }}
              />
              <div style={{ marginTop: 8, color: '#888' }}>Update stocks and liquidity</div>
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Link href="/v1/admin/configs">
            <Card hoverable>
              <Statistic
                title="System Configs"
                value="Configs"
                prefix={<SettingOutlined />}
                valueStyle={{ fontSize: 16 }}
              />
              <div style={{ marginTop: 8, color: '#888' }}>Global system settings</div>
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Link href="/v1/admin/subscriptions">
            <Card hoverable>
              <Statistic
                title="Subscriptions"
                value="Plans"
                prefix={<DollarOutlined />}
                valueStyle={{ fontSize: 16 }}
              />
              <div style={{ marginTop: 8, color: '#888' }}>Manage subscription plans</div>
            </Card>
          </Link>
        </Col>
      </Row>

      <div style={{ marginTop: 32 }}>
        <Card title="Quick Actions" bordered={false}>
          <p>Select a module from the sidebar or the cards above to get started.</p>
        </Card>
      </div>
    </div>
  );
}
