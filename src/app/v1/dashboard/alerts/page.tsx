"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Button,
  Col,
  Row,
  message,
  Spin,
} from "antd";
import {
  PlusOutlined,
} from "@ant-design/icons";

import AlertCard from "@/components/alerts/AlertCard";
import AlertDrawer from "@/components/alerts/AlertDrawer";
import type { Alert } from "@/components/alerts/types"

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);

  // Fetch alerts from API
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/dashboard/alert");
      const data = await res.json();
      setAlerts(data);
    } catch (error) {
      message.error("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Add or Update alert (passed to drawer)
  const handleAddOrEdit = async (values: Partial<Alert>) => {
    try {
      const endpoint = "/api/v1/dashboard/alert";
      const method = editingAlert ? "PUT" : "POST";
      const body = editingAlert
        ? JSON.stringify({ id: editingAlert._id, ...values })
        : JSON.stringify(values);

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!res.ok) throw new Error("Failed to save alert");
      const savedAlert = await res.json();

      if (editingAlert) {
        setAlerts((prev) =>
          prev.map((a) => (a._id === savedAlert._id ? savedAlert : a))
        );
        message.success("Alert updated successfully");
      } else {
        setAlerts((prev) => [savedAlert, ...prev]);
        message.success("Alert added successfully");
      }

      setDrawerOpen(false);
      setEditingAlert(null);
    } catch (error) {
      console.error("Save alert error:", error);
      message.error("Failed to save alert");
    }
  };

  // Delete alert (passed to card)
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/v1/dashboard/alert?id=${id}`, { method: "DELETE" });
      setAlerts((prev) => prev.filter((a) => a._id !== id));
      message.success("Alert deleted");
    } catch {
      message.error("Failed to delete alert");
    }
  };

  // Toggle active state (passed to card)
  const handleToggleActive = async (alert: Alert, active: boolean) => {
    try {
      const res = await fetch("/api/v1/dashboard/alert", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: alert._id, ...alert, active }),
      });
      const updated = await res.json();
      setAlerts((prev) =>
        prev.map((a) => (a._id === updated._id ? updated : a))
      );
    } catch {
      message.error("Failed to update alert");
    }
  };

  // Open drawer for add/edit
  const openDrawer = (alert?: Alert) => {
    setEditingAlert(alert || null);
    setDrawerOpen(true);
  };

  if (loading) return <Spin style={{ marginTop: 50 }} size="large" />;

  return (
    <div style={{ padding: "24px", position: "relative" }}>
      <h2 style={{ marginBottom: 16, fontWeight: 600 }}>📢 Price Alerts</h2>

      <Row gutter={[16, 16]}>
        {alerts.map((alert) => (
          <Col
            key={alert._id}
            xs={24}
            sm={12}
            md={8}
            lg={6}
            style={{ display: "flex" }}
          >
            <AlertCard
              alert={alert}
              onToggleActive={handleToggleActive}
              onEdit={() => openDrawer(alert)}
              onDelete={handleDelete}
            />
          </Col>
        ))}
      </Row>

      {/* Floating Add Button */}
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          borderRadius: "50%",
          width: 56,
          height: 56,
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          zIndex: 1000,
        }}
        onClick={() => openDrawer()}
      />

      {/* Drawer */}
      <AlertDrawer
        open={drawerOpen}
        editingAlert={editingAlert}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleAddOrEdit}
      />
    </div>
  );
};

export default AlertsPage;