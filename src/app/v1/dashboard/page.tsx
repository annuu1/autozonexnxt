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

  // Zones modal state
  const [zonesVisible, setZonesVisible] = useState(false);
  const [zonesData, setZonesData] = useState<any[]>([]);
  const [zonesLoading, setZonesLoading] = useState(false);

  // Invalid modal state
  const [invalidVisible, setInvalidVisible] = useState(false);
  const [invalidData, setInvalidData] = useState<any[]>([]);
  const [invalidLoading, setInvalidLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSymbol, setEditingSymbol] = useState<string>("");

  // Fetch stats
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

  // Zones handlers
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

  const handleTickerClick = async (zone: any) => {
    try {
      const res = await fetch(`/api/v1/demand-zones/${zone._id}/seen`, {
        method: "POST",
      });
      const updated = await res.json();
      const lastSeen = updated?.last_seen ?? new Date().toISOString();
      setZonesData((prev) =>
        prev.map((z) => (z._id === zone._id ? { ...z, last_seen: lastSeen } : z))
      );
    } catch (err) {
      console.error("Failed to update last_seen:", err);
    }
  };

  // Invalid symbols handlers
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

  const handleUpdateSymbol = async (record: any) => {
    try {
      const res = await fetch(`/api/v1/symbols/${record._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: editingSymbol }),
      });
      if (res.ok) {
        message.success("Symbol updated");
        setInvalidData((prev) =>
          prev.map((s) =>
            s._id === record._id ? { ...s, symbol: editingSymbol } : s
          )
        );
        setEditingId(null);
      } else {
        message.error("Failed to update");
      }
    } catch (err) {
      console.error("Update failed:", err);
      message.error("Error updating symbol");
    }
  };

  const handleDeleteSymbol = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/symbols/${id}`, { method: "DELETE" });
      if (res.ok) {
        message.success("Symbol deleted");
        setInvalidData((prev) => prev.filter((s) => s._id !== id));
      } else {
        message.error("Failed to delete");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      message.error("Error deleting symbol");
    }
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

        {/* Invalid */}
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

        {/* Outdated */}
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
