"use client";

import { useEffect, useState } from "react";
import { Card, Row, Col, Table, Button, Space, Typography } from "antd";
import {
  UserOutlined,
  DollarCircleOutlined,
  DesktopOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

export default function DashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    demandZones: 0,
    symbols: 0,
    invalidSymbols: 0,
    outdatedSymbols: 0,
  });
  const [loading, setLoading] = useState(true);

  const dataSource = [
    { key: "1", name: "John Doe", email: "john@example.com", role: "Admin" },
    { key: "2", name: "Jane Smith", email: "jane@example.com", role: "User" },
  ];

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
  ];

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/v1/dashboard");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        📊 Dashboard
      </Title>

      {/* Top cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            loading={loading}
            title="Users"
            value={stats.users}
            icon={<UserOutlined style={{ fontSize: 32, color: "#fff" }} />}
            gradient="linear-gradient(135deg, #6DD5FA, #2980B9)"
          />
        </Col>

        <Col xs={24} sm={12} md={8}>
          <StatCard
            loading={loading}
            title="Demand Zones"
            value={stats.demandZones}
            icon={<DollarCircleOutlined style={{ fontSize: 32, color: "#fff" }} />}
            gradient="linear-gradient(135deg, #F7971E, #FFD200)"
          />
        </Col>

        <Col xs={24} sm={12} md={8}>
          <StatCard
            loading={loading}
            title="Symbols"
            value={stats.symbols}
            icon={<DesktopOutlined style={{ fontSize: 32, color: "#fff" }} />}
            gradient="linear-gradient(135deg, #56ab2f, #a8e063)"
          />
        </Col>

        <Col xs={24} sm={12} md={8}>
          <StatCard
            loading={loading}
            title="Invalid Symbols"
            value={stats.invalidSymbols}
            icon={<WarningOutlined style={{ fontSize: 32, color: "#fff" }} />}
            gradient="linear-gradient(135deg, #ff512f, #dd2476)"
          />
        </Col>

        <Col xs={24} sm={12} md={8}>
          <StatCard
            loading={loading}
            title="Outdated Symbols"
            value={stats.outdatedSymbols}
            icon={<ClockCircleOutlined style={{ fontSize: 32, color: "#fff" }} />}
            gradient="linear-gradient(135deg, #f7971e, #f44336)"
          />
        </Col>
      </Row>

      {/* Table section */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title="Recent Users"
            bordered={false}
            style={{ borderRadius: 8 }}
            bodyStyle={{ padding: 16 }}
          >
            <Table
              dataSource={dataSource}
              columns={columns}
              pagination={false}
              size="middle"
              bordered
            />
          </Card>
        </Col>
      </Row>

      {/* Quick actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title="Quick Actions"
            bordered={false}
            style={{ borderRadius: 8 }}
            bodyStyle={{ padding: 16 }}
          >
            <Space wrap>
              <Button type="primary" icon={<PlusOutlined />}>
                Add User
              </Button>
              <Button icon={<DownloadOutlined />}>Export Data</Button>
              <Button danger icon={<DeleteOutlined />}>
                Delete Selected
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

// 🔹 Reusable Stat Card
function StatCard({
  title,
  value,
  icon,
  gradient,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  loading: boolean;
}) {
  return (
    <Card
      style={{
        background: gradient,
        color: "#fff",
        borderRadius: 8,
      }}
      bordered={false}
      loading={loading}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {icon}
        <div style={{ marginLeft: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 500 }}>{title}</div>
          <div style={{ fontSize: 24, fontWeight: "bold" }}>{value}</div>
        </div>
      </div>
    </Card>
  );
}
