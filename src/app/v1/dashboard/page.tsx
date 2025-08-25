"use client";

import { useEffect, useState } from "react";
import { Row, Col, Typography, DatePicker, message } from "antd";
import dayjs from "dayjs";
import {
  UserOutlined,
  DollarCircleOutlined,
  DesktopOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  AimOutlined,
} from "@ant-design/icons";

import StatCard from "@/components/dashboard/StatCard";
import ZonesModal from "@/components/dashboard/ZonesModal";
import InvalidSymbolsModal from "@/components/dashboard/InvalidSymbolsModal";

// Hooks
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useZones } from "@/hooks/useZones";
import { useInvalidSymbols }  from "@/hooks/useInvalidSymbols";

const { Title } = Typography;

export default function DashboardPage() {

  // Zones modal state
  const [zonesVisible, setZonesVisible] = useState(false);

  // Invalid modal state
  const [invalidVisible, setInvalidVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSymbol, setEditingSymbol] = useState<string>("");

  const [selectedDate, setSelectedDate] = useState<string>("");

const { data: stats, isLoading, isError, error, refetch } = useDashboardStats(selectedDate);
const { data: zonesData, isFetching: zonesLoading, refetch: refetchZones, markZoneSeen } = useZones();
const { data: invalidData, isFetching: invalidLoading, refetch: refetchInvalid, updateSymbol, deleteSymbol } = useInvalidSymbols();

  useEffect(() => {
    refetch();
  }, []);

  const handleDateChange = (date: any, dateString: string) => {
    setSelectedDate(dateString);
    refetch();
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

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        📊 Dashboard
      </Title>

      {/* Date selector */}
      <div style={{ marginBottom: 20 }}>
        <span style={{ marginRight: 8 }}>Check outdated symbols as of:</span>
        <DatePicker
          onChange={handleDateChange}
          value={selectedDate ? dayjs(selectedDate) : null}
        />
      </div>

      {/* Top Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            loading={isLoading}
            title="Users"
            value={stats?.users??0}
            icon={<UserOutlined style={{ fontSize: 32, color: "#fff" }} />}
            gradient="linear-gradient(135deg, #6DD5FA, #2980B9)"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            loading={isLoading}
            title="Demand Zones"
            value={stats?.demandZones??0}
            icon={<DollarCircleOutlined style={{ fontSize: 32, color: "#fff" }} />}
            gradient="linear-gradient(135deg, #F7971E, #FFD200)"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            loading={isLoading}
            title="Symbols"
            value={stats?.symbols??0}
            icon={<DesktopOutlined style={{ fontSize: 32, color: "#fff" }} />}
            gradient="linear-gradient(135deg, #56ab2f, #a8e063)"
          />
        </Col>

        {/* Invalid */}
        <Col xs={24} sm={12} md={8}>
          <StatCard
            loading={isLoading}
            title="Invalid Symbols"
            value={stats?.invalidSymbols??0}
            icon={<WarningOutlined style={{ fontSize: 32, color: "#fff" }} />}
            gradient="linear-gradient(135deg, #ff512f, #dd2476)"
            onClick={openInvalidSymbols}
          />
        </Col>

        {/* Outdated */}
        <Col xs={24} sm={12} md={8}>
          <StatCard
            loading={isLoading}
            title="Outdated Symbols"
            value={stats?.outdatedSymbols??0}
            icon={<ClockCircleOutlined style={{ fontSize: 32, color: "#fff" }} />}
            gradient="linear-gradient(135deg, #f7971e, #f44336)"
          />
        </Col>

        {/* Zones Near Day Low */}
        <Col xs={24} sm={12} md={8}>
          <StatCard
            loading={isLoading}
            title="Zones Near Day Low (3%)"
            value={stats?.zonesNearDayLow??0}
            icon={<AimOutlined style={{ fontSize: 32, color: "#fff" }} />}
            gradient="linear-gradient(135deg, #00b09b, #96c93d)"
            onClick={openZones}
          />
        </Col>
      </Row>

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
    </div>
  );
}
