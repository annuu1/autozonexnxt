"use client";

import { Card, Row, Col, Table, Button, Space, Typography } from "antd";
import {
  UserOutlined,
  DollarCircleOutlined,
  DesktopOutlined,
  PlusOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

export default function DashboardPage() {
  const dataSource = [
    { key: "1", name: "John Doe", email: "john@example.com", role: "Admin" },
    { key: "2", name: "Jane Smith", email: "jane@example.com", role: "User" },
  ];

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        📊 Dashboard
      </Title>

      {/* Top cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card
            style={{
              background: "linear-gradient(135deg, #6DD5FA, #2980B9)",
              color: "#fff",
              borderRadius: 8,
            }}
            bordered={false}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <UserOutlined style={{ fontSize: 32, marginRight: 16, color: "#fff" }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>Users</div>
                <div style={{ fontSize: 24, fontWeight: "bold" }}>1,234</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card
            style={{
              background: "linear-gradient(135deg, #F7971E, #FFD200)",
              color: "#fff",
              borderRadius: 8,
            }}
            bordered={false}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <DollarCircleOutlined style={{ fontSize: 32, marginRight: 16, color: "#fff" }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>Revenue</div>
                <div style={{ fontSize: 24, fontWeight: "bold" }}>$5,678</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card
            style={{
              background: "linear-gradient(135deg, #56ab2f, #a8e063)",
              color: "#fff",
              borderRadius: 8,
            }}
            bordered={false}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <DesktopOutlined style={{ fontSize: 32, marginRight: 16, color: "#fff" }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>Active Sessions</div>
                <div style={{ fontSize: 24, fontWeight: "bold" }}>89</div>
              </div>
            </div>
          </Card>
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
