"use client";

import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Typography,
  DatePicker,
  message,
  Table,
  Button,
  Card,
} from "antd";
import dayjs from "dayjs";
import { Dayjs } from "dayjs";
import {
  UserOutlined,
  DollarCircleOutlined,
  DesktopOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  AimOutlined,
  ReloadOutlined,
  PlusOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

import StatCard from "@/components/dashboard/StatCard";
import ZonesModal from "@/components/dashboard/ZonesModal";
import InvalidSymbolsModal from "@/components/dashboard/InvalidSymbolsModal";
import AsidePanel from "@/components/dashboard/AsidePanel";

// Hooks
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useZones } from "@/hooks/useZones";
import { useInvalidSymbols } from "@/hooks/useInvalidSymbols";
import useAuthStore from "@/store/useAuthStore";

const { Title } = Typography;

export default function DashboardPage() {
  // Zones modal state
  const [zonesVisible, setZonesVisible] = useState(false);

  // Invalid modal state
  const [invalidVisible, setInvalidVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSymbol, setEditingSymbol] = useState<string>("");

  const [selectedDate, setSelectedDate] = useState<string>("");

  const {
    data: stats,
    isLoading,
    refetch,
  } = useDashboardStats(selectedDate);

  const {
    data: zonesData,
    isFetching: zonesLoading,
    refetch: refetchZones,
    markZoneSeen,
  } = useZones();

  const {
    data: invalidData,
    isFetching: invalidLoading,
    refetch: refetchInvalid,
    updateSymbol,
    deleteSymbol,
  } = useInvalidSymbols();

  const { user } = useAuthStore();

  useEffect(() => {
    refetch();
  }, []);

  const handleDateChange = (date: Dayjs | null, dateString: string | string[]) => {
    if (typeof dateString === "string") {
      setSelectedDate(dateString);
      refetch();
    }
  };

  // Zones handlers
  const openZones = async () => {
    setZonesVisible(true);
    refetchZones();
  };

  const handleTickerClick = async (zone: any) => {
    try {
      await markZoneSeen.mutateAsync(zone._id);
    } catch (err) {
      console.error("Failed to update last_seen:", err);
    }
  };

  // Invalid symbols handlers
  const openInvalidSymbols = async () => {
    setInvalidVisible(true);
    refetchInvalid();
  };

  const handleUpdateSymbol = async (record: any) => {
    updateSymbol.mutate({ id: record._id, symbol: editingSymbol });
    message.success("Symbol updated");
    setEditingId(null);
  };

  const handleDeleteSymbol = async (id: string) => {
    deleteSymbol.mutate(id);
    message.success("Symbol deleted");
  };

  // Static table data
  const columns = [
    { title: "Symbol", dataIndex: "symbol", key: "symbol" },
    { title: "Type", dataIndex: "type", key: "type" },
    { title: "Status", dataIndex: "status", key: "status" },
  ];

  const dataSource = [
    { key: "1", symbol: "RELIANCE", type: "Demand Zone", status: "Active" },
    { key: "2", symbol: "TCS", type: "Supply Zone", status: "Pending" },
    { key: "3", symbol: "INFY", type: "Invalid", status: "Removed" },
  ];

  const isAdmin = user?.roles.includes("admin");
  const isUser = user?.roles.includes("user");

  return (
    <Row gutter={16}>
      {/* Main Content */}
      <Col xs={24} md={18}>
        <Title level={2} style={{ marginBottom: 24 }}>
          📊 Dashboard
        </Title>

        {/* Date selector + Quick Actions */}
        <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
          <div>
            <span style={{ marginRight: 8 }}>Check outdated symbols as of:</span>
            <DatePicker
              onChange={handleDateChange}
              value={selectedDate ? dayjs(selectedDate) : null}
            />
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Button icon={<ReloadOutlined />} style={{ marginRight: 8 }}>
              Refresh
            </Button>
            <Button type="primary" icon={<PlusOutlined />} style={{ marginRight: 8 }}>
              Add Symbol
            </Button>
            <Button icon={<DownloadOutlined />}>Export</Button>
          </div>
        </div>

        {/* Role-based Cards */}
        <Row gutter={[16, 16]}>
          {/* Admin: show all cards */}
          {isAdmin && (
            <>
              <Col xs={24} sm={12} md={8}>
                <StatCard
                  loading={isLoading}
                  title="Users"
                  value={stats?.users ?? 0}
                  icon={<UserOutlined style={{ fontSize: 32, color: "#fff" }} />}
                  gradient="linear-gradient(135deg, #6DD5FA, #2980B9)"
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <StatCard
                  loading={isLoading}
                  title="Demand Zones"
                  value={stats?.demandZones ?? 0}
                  icon={<DollarCircleOutlined style={{ fontSize: 32, color: "#fff" }} />}
                  gradient="linear-gradient(135deg, #F7971E, #FFD200)"
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <StatCard
                  loading={isLoading}
                  title="Symbols"
                  value={stats?.symbols ?? 0}
                  icon={<DesktopOutlined style={{ fontSize: 32, color: "#fff" }} />}
                  gradient="linear-gradient(135deg, #56ab2f, #a8e063)"
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <StatCard
                  loading={isLoading}
                  title="Invalid Symbols"
                  value={stats?.invalidSymbols ?? 0}
                  icon={<WarningOutlined style={{ fontSize: 32, color: "#fff" }} />}
                  gradient="linear-gradient(135deg, #ff512f, #dd2476)"
                  onClick={openInvalidSymbols}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <StatCard
                  loading={isLoading}
                  title="Outdated Symbols"
                  value={stats?.outdatedSymbols ?? 0}
                  icon={<ClockCircleOutlined style={{ fontSize: 32, color: "#fff" }} />}
                  gradient="linear-gradient(135deg, #f7971e, #f44336)"
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <StatCard
                  loading={isLoading}
                  title="Zones Near Day Low (3%)"
                  value={stats?.zonesNearDayLow ?? 0}
                  icon={<AimOutlined style={{ fontSize: 32, color: "#fff" }} />}
                  gradient="linear-gradient(135deg, #00b09b, #96c93d)"
                  onClick={openZones}
                />
              </Col>
            </>
          )}

          {/* User: show only 3 cards */}
          {isUser && (
            <>
              <Col xs={24} sm={12} md={8}>
                <StatCard
                  loading={isLoading}
                  title="Demand Zones"
                  value={stats?.demandZones ?? 0}
                  icon={<DollarCircleOutlined style={{ fontSize: 32, color: "#fff" }} />}
                  gradient="linear-gradient(135deg, #F7971E, #FFD200)"
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <StatCard
                  loading={isLoading}
                  title="Symbols"
                  value={stats?.symbols ?? 0}
                  icon={<DesktopOutlined style={{ fontSize: 32, color: "#fff" }} />}
                  gradient="linear-gradient(135deg, #56ab2f, #a8e063)"
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <StatCard
                  loading={isLoading}
                  title="Zones Near Day Low (3%)"
                  value={stats?.zonesNearDayLow ?? 0}
                  icon={<AimOutlined style={{ fontSize: 32, color: "#fff" }} />}
                  gradient="linear-gradient(135deg, #00b09b, #96c93d)"
                  onClick={openZones}
                />
              </Col>
            </>
          )}
        </Row>

        {/* Table below cards */}
        <Card title="📋 Recent Symbols" style={{ marginTop: 24 }}>
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
          />
        </Card>
      </Col>

      {/* Aside Section */}
      <Col xs={24} md={6}>
        <AsidePanel
          marketSummary={[
            { label: "NIFTY", value: "22,300 (+0.5%)", trend: "up" },
            { label: "BANKNIFTY", value: "48,200 (+0.3%)", trend: "up" },
            { label: "SENSEX", value: "74,100 (-0.2%)", trend: "down" },
          ]}
          alerts={[
            "30 Zones Near Day Low (3%)",
            "20 Symbols missing from zones",
            "10 Outdated symbols",
          ]}
          notifications={[
            "New demand zone in RELIANCE",
            "INFY removed from outdated list",
          ]}
        />
      </Col>

      {/* Modals */}
      <ZonesModal
        open={zonesVisible}
        onClose={() => setZonesVisible(false)}
        zones={zonesData}
        loading={zonesLoading}
        onTickerClick={handleTickerClick}
      />

      <InvalidSymbolsModal
        open={invalidVisible}
        onClose={() => setInvalidVisible(false)}
        data={invalidData}
        loading={invalidLoading}
        editingId={editingId}
        editingSymbol={editingSymbol}
        setEditingId={setEditingId}
        setEditingSymbol={setEditingSymbol}
        handleUpdateSymbol={handleUpdateSymbol}
        handleDeleteSymbol={handleDeleteSymbol}
      />
    </Row>
  );
}
