"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Button,
  Col,
  Pagination,
  Row,
  message,
  Spin,
} from "antd";
import {
  PlusOutlined,
  BellOutlined,
} from "@ant-design/icons";
import debounce from "lodash.debounce";

import AlertCard from "@/components/alerts/AlertCard";
import AlertDrawer from "@/components/alerts/AlertDrawer";
import type { Alert } from "@/components/alerts/types";

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);

  // Fetch alerts from API with pagination
  const fetchAlerts = async (page = current, limit = pageSize) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/dashboard/alert?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch alerts");
      const { alerts, total: totalCount } = await res.json();
      setAlerts(alerts);
      setTotal(totalCount);
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

      const nextPage = editingAlert ? current : 1;
      setCurrent(nextPage);
      await fetchAlerts(nextPage, pageSize);

      if (editingAlert) {
        message.success("Alert updated successfully");
      } else {
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
      
      // Adjust page if deleting the last item on current page
      const nextPage = alerts.length === 1 && current > 1 ? current - 1 : current;
      setCurrent(nextPage);
      await fetchAlerts(nextPage, pageSize);
      
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

  // Pagination handler
  const onPaginate = (page: number, size?: number) => {
    setCurrent(page);
    if (size) {
      setPageSize(size);
    }
    fetchAlerts(page, size || pageSize);
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

      {total > 0 && (
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Pagination
            current={current}
            pageSize={pageSize}
            total={total}
            onChange={onPaginate}
            showSizeChanger
            showQuickJumper
            showTotal={(totalCount, range) =>
              `${range[0]}-${range[1]} of ${totalCount} alerts`
            }
          />
        </div>
      )}

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