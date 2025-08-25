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

  // 🔹 State for Zones Near Day Low
  const [zonesVisible, setZonesVisible] = useState(false);
  const [zonesData, setZonesData] = useState<any[]>([]);
  const [zonesLoading, setZonesLoading] = useState(false);

  // 🔹 State for Invalid Symbols
  const [invalidVisible, setInvalidVisible] = useState(false);
  const [invalidData, setInvalidData] = useState<any[]>([]);
  const [invalidLoading, setInvalidLoading] = useState(false);

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

  // 🔹 Open Zones Near Day Low
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

  // 🔹 Open Invalid Symbols
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

  // 🔹 Delete Invalid Symbol
  const handleDeleteSymbol = async (id: string) => {
    try {
      await fetch(`/api/v1/symbols/${id}`, { method: "DELETE" });
      message.success("Symbol deleted");
      setInvalidData((prev) => prev.filter((s) => s._id !== id));
    } catch {
      message.error("Failed to delete symbol");
    }
  };

  // 🔹 Update Invalid Symbol
  const handleUpdateSymbol = async (symbol: any) => {
    try {
      const res = await fetch(`/api/v1/symbols/${symbol._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "active",
          company_name: symbol.company_name || "Updated Company",
        }),
      });
      const updated = await res.json();
      setInvalidData((prev) =>
        prev.map((s) => (s._id === updated._id ? updated : s))
      );
      message.success("Symbol updated");
    } catch {
      message.error("Failed to update symbol");
    }
  };

  // 🟢 Helper: Last Seen Tag
  const getLastSeenTag = (lastSeen?: string) => {
    if (!lastSeen) return <Tag color="blue">New</Tag>;

    const seenDate = new Date(lastSeen);
    const today = new Date();
    const diffDays =
      (today.getTime() - seenDate.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays < 1) return <Tag color="green">Today</Tag>;
    if (diffDays <= 3) return <Tag color="lime">{seenDate.toLocaleDateString()}</Tag>;
    if (diffDays <= 10) return <Tag color="orange">{seenDate.toLocaleDateString()}</Tag>;
    return <Tag color="red">{seenDate.toLocaleDateString()}</Tag>;
  };

  // 🟢 Helper: Diff Tag
  const getDiffTag = (percent: number) => {
    if (percent < 0) return <Tag color="red">{percent.toFixed(2)}%</Tag>;
    if (percent <= 1) return <Tag color="gold">{percent.toFixed(2)}%</Tag>;
    if (percent <= 3) return <Tag color="green">{percent.toFixed(2)}%</Tag>;
    return <Tag>{percent.toFixed(2)}%</Tag>;
  };

  // 🟢 Clickable Ticker → update last_seen
  const handleTickerClick = async (zone: any) => {
    try {
      const res = await fetch(`/api/v1/demand-zones/${zone._id}/seen`, {
        method: "POST",
      });
      const updated = await res.json();
      const lastSeen = updated?.last_seen ?? new Date().toISOString();

      setZonesData((prev) =>
        prev.map((z) =>
          z._id === zone._id ? { ...z, last_seen: lastSeen } : z
        )
      );
    } catch (err) {
      console.error("Failed to update last_seen:", err);
    }
  };

  // 🔹 Table columns for Invalid Symbols
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
          <Button type="primary" onClick={() => handleUpdateSymbol(row)}>
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

  // 🔹 Table columns for Zones
  const zoneColumns = [
    {
      title: "Ticker",
      dataIndex: "ticker",
      key: "ticker",
      render: (_: any, row: any) => (
        <Button type="link" onClick={() => handleTickerClick(row)}>
          {row.ticker}
          <div style={{ fontSize: 12 }}>{getLastSeenTag(row.last_seen)}</div>
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
    {
      title: "Diff %",
      dataIndex: "percentDiff",
      key: "percentDiff",
      render: (v: number) => getDiffTag(v * 100),
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        📊 Dashboard
      </Title>

      {/* Date selector for outdated check */}
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
            title={`Outdated Symbols`}
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
