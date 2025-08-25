"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Typography,
  DatePicker,
  Modal,
  Tag,
  Space,
  Popconfirm,
  message,
  Form,
  Input,
} from "antd";
import dayjs from "dayjs";
import {
  UserOutlined,
  DollarCircleOutlined,
  DesktopOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  AimOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

export default function DashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    demandZones: 0,
    symbols: 0,
    invalidSymbols: 0,
    outdatedSymbols: 0,
    zonesNearDayLow: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // 🔹 Zones Near Day Low
  const [zonesVisible, setZonesVisible] = useState(false);
  const [zonesData, setZonesData] = useState<any[]>([]);
  const [zonesLoading, setZonesLoading] = useState(false);

  // 🔹 Invalid Symbols
  const [invalidVisible, setInvalidVisible] = useState(false);
  const [invalidData, setInvalidData] = useState<any[]>([]);
  const [invalidLoading, setInvalidLoading] = useState(false);

  // 🔹 Edit Symbol Modal
  const [editVisible, setEditVisible] = useState(false);
  const [editingSymbol, setEditingSymbol] = useState<any>(null);
  const [form] = Form.useForm();

  async function fetchStats(date?: string) {
    try {
      let url = "/api/v1/dashboard";
      if (date) url += `?date=${date}`;

      const res = await fetch(url);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDateChange = (date: any, dateString: string) => {
    setSelectedDate(dateString);
    fetchStats(dateString);
  };

  // 🔹 Zones
  const openZones = async () => {
    setZonesVisible(true);
    setZonesLoading(true);
    try {
      const res = await fetch("/api/v1/dashboard/zones-in-range");
      const data = await res.json();
      setZonesData(data);
    } catch (err) {
      console.error("Failed to load zones:", err);
    } finally {
      setZonesLoading(false);
    }
  };

  // 🔹 Invalid Symbols
  const openInvalidSymbols = async () => {
    setInvalidVisible(true);
    setInvalidLoading(true);
    try {
      const res = await fetch("/api/v1/dashboard/invalid-symbols");
      const data = await res.json();
      setInvalidData(data);
    } catch (err) {
      console.error("Failed to load invalid symbols:", err);
    } finally {
      setInvalidLoading(false);
    }
  };

  // 🔹 Delete Symbol
  const handleDeleteSymbol = async (id: string) => {
    try {
      await fetch(`/api/v1/symbols/${id}`, { method: "DELETE" });
      message.success("Symbol deleted");
      setInvalidData((prev) => prev.filter((s) => s._id !== id));
    } catch {
      message.error("Failed to delete symbol");
    }
  };

  // 🔹 Open Edit Modal
  const openEditModal = (symbol: any) => {
    setEditingSymbol(symbol);
    form.setFieldsValue({
      symbol: symbol.symbol,
      company_name: symbol.company_name || "",
    });
    setEditVisible(true);
  };

  // 🔹 Submit Update
  const handleUpdateSymbol = async () => {
    try {
      const values = await form.validateFields();

      const res = await fetch(`/api/v1/symbols/${editingSymbol._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: values.symbol,
          company_name: values.company_name,
          status: "active",
        }),
      });

      const updated = await res.json();

      setInvalidData((prev) =>
        prev.map((s) => (s._id === updated._id ? updated : s))
      );

      message.success("Symbol updated successfully");
      setEditVisible(false);
      setEditingSymbol(null);
      form.resetFields();
    } catch (err) {
      message.error("Failed to update symbol");
    }
  };

  // 🟢 Invalid Symbols Columns
  const invalidColumns = [
    { title: "Symbol", dataIndex: "symbol", key: "symbol" },
    {
      title: "Company",
      dataIndex: "company_name",
      key: "company_name",
      render: (v: string) => v || <Tag color="red">Unknown</Tag>,
    },
    { title: "LTP", dataIndex: "ltp", key: "ltp" },
    { title: "Day Low", dataIndex: "day_low", key: "day_low" },
    {
      title: "Watchlists",
      dataIndex: "watchlists",
      key: "watchlists",
      render: (arr: string[]) => arr?.join(", "),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => (
        <Tag color={s === "active" ? "green" : "red"}>{s}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, row: any) => (
        <Space>
          <Button type="primary" onClick={() => openEditModal(row)}>
            Update
          </Button>
          <Popconfirm
            title="Delete this symbol?"
            onConfirm={() => handleDeleteSymbol(row._id)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 🟢 Zones Columns
  const zoneColumns = [
    {
      title: "Ticker",
      dataIndex: "ticker",
      key: "ticker",
      render: (_: any, row: any) => (
        <Button type="link">
          {row.ticker}
          <div style={{ fontSize: 12 }}>
            {row.last_seen ? dayjs(row.last_seen).format("YYYY-MM-DD") : "New"}
          </div>
        </Button>
      ),
    },
    { title: "Zone ID", dataIndex: "zone_id", key: "zone_id" },
    { title: "Proximal", dataIndex: "proximal_line", key: "proximal_line" },
    { title: "Distal", dataIndex: "distal_line", key: "distal_line" },
    { title: "Pattern", dataIndex: "pattern", key: "pattern" },
    { title: "Freshness", dataIndex: "freshness", key: "freshness" },
    { title: "Trade Score", dataIndex: "trade_score", key: "trade_score" },
    { title: "Day Low", dataIndex: "day_low", key: "day_low" },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        📊 Dashboard
      </Title>

      <div style={{ marginBottom: 20 }}>
        <span style={{ marginRight: 8 }}>Check outdated symbols as of:</span>
        <DatePicker
          onChange={handleDateChange}
          value={selectedDate ? dayjs(selectedDate) : null}
        />
      </div>

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

        {/* Invalid + Outdated */}
        <Col xs={24} sm={12} md={8}>
          <StatCard
            loading={loading}
            title="Invalid Symbols"
            value={stats.invalidSymbols}
            icon={<WarningOutlined style={{ fontSize: 32, color: "#fff" }} />}
            gradient="linear-gradient(135deg, #ff512f, #dd2476)"
            onClick={openInvalidSymbols}
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

        {/* Zones Near Day Low */}
        <Col xs={24} sm={12} md={8}>
          <StatCard
            loading={loading}
            title="Zones Near Day Low (3%)"
            value={stats.zonesNearDayLow}
            icon={<AimOutlined style={{ fontSize: 32, color: "#fff" }} />}
            gradient="linear-gradient(135deg, #00b09b, #96c93d)"
            onClick={openZones}
          />
        </Col>
      </Row>

      {/* Zones Modal */}
      <Modal
        title="Zones Near Day Low (within 3%)"
        open={zonesVisible}
        onCancel={() => setZonesVisible(false)}
        footer={null}
        width="85%"
      >
        <Table
          dataSource={zonesData}
          columns={zoneColumns}
          rowKey="_id"
          loading={zonesLoading}
          bordered
        />
      </Modal>

      {/* Invalid Symbols Modal */}
      <Modal
        title="Invalid Symbols"
        open={invalidVisible}
        onCancel={() => setInvalidVisible(false)}
        footer={null}
        width="85%"
      >
        <Table
          dataSource={invalidData}
          columns={invalidColumns}
          rowKey="_id"
          loading={invalidLoading}
          bordered
        />
      </Modal>

      {/* Edit Symbol Modal */}
      <Modal
        title="Edit Symbol"
        open={editVisible}
        onCancel={() => {
          setEditVisible(false);
          form.resetFields();
        }}
        onOk={handleUpdateSymbol}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="symbol"
            label="Symbol"
            rules={[{ required: true, message: "Symbol is required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="company_name" label="Company Name">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
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
  onClick,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  loading: boolean;
  onClick?: () => void;
}) {
  return (
    <Card
      style={{
        background: gradient,
        color: "#fff",
        borderRadius: 8,
        cursor: onClick ? "pointer" : "default",
      }}
      bordered={false}
      loading={loading}
      onClick={onClick}
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
