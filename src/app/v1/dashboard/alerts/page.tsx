"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  message,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BellOutlined,
} from "@ant-design/icons";
import debounce from "lodash.debounce";
import ExpandableNote from "@/components/common/ExpandableNote";

const { Option } = Select;

interface Alert {
  _id: string;
  symbol: string;
  condition: "Above" | "Below";
  price: number;
  active: boolean;
  note?: string;
}

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [form] = Form.useForm();

  // Symbol search
  const [symbols, setSymbols] = useState<{ value: string; label: string }[]>([]);
  const [fetchingSymbols, setFetchingSymbols] = useState(false);

  // Debounced fetch for symbols
  const fetchSymbols = async (query: string) => {
    if (!query) return;
    setFetchingSymbols(true);
    try {
      const res = await fetch(`/api/v1/symbols?search=${query}`);
      const data = await res.json();

      const options = data.map((item: any) => ({
        value: item.symbol,
        label: item.symbol,
      }));
      setSymbols(options);
    } catch (err) {
      console.error("Error fetching symbols:", err);
    } finally {
      setFetchingSymbols(false);
    }
  };

  // debounce symbol fetching
  const debouncedFetchSymbols = useCallback(debounce(fetchSymbols, 400), []);

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

  // Add or Update alert
  const handleAddOrEdit = async (values: any) => {
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
      form.resetFields();
    } catch (error) {
      console.error("Save alert error:", error);
      message.error("Failed to save alert");
    }
  };

  // Delete alert
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/v1/dashboard/alert?id=${id}`, { method: "DELETE" });
      setAlerts((prev) => prev.filter((a) => a._id !== id));
      message.success("Alert deleted");
    } catch {
      message.error("Failed to delete alert");
    }
  };

  // Toggle active state
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
            <Card
              style={{
                width: "100%",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
              title={
                <Space>
                  <BellOutlined />
                  <strong>{alert.symbol}</strong>
                </Space>
              }
              extra={
                <Switch
                  checked={alert.active}
                  onChange={(checked) => handleToggleActive(alert, checked)}
                />
              }
              actions={[
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingAlert(alert);
                    form.setFieldsValue(alert);
                    setDrawerOpen(true);
                  }}
                >
                  Edit
                </Button>,
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(alert._id)}
                >
                  Delete
                </Button>,
              ]}
            >
              <p style={{ marginBottom: 6 }}>
                <strong>Condition:</strong>{" "}
                {alert.condition === "Above" ? (
                  <Tag color="green">Above</Tag>
                ) : (
                  <Tag color="red">Below</Tag>
                )}
              </p>
              <p style={{ marginBottom: 6 }}>
                <strong>Target Price:</strong> ₹{alert.price}
              </p>
              {alert.note && (
                <ExpandableNote note={alert.note} />
              )}
            </Card>
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
        onClick={() => {
          form.resetFields();
          setEditingAlert(null);
          setDrawerOpen(true);
        }}
      />

      {/* Drawer Form */}
      <Drawer
        title={editingAlert ? "Edit Alert" : "Add Alert"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={380}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleAddOrEdit}
          initialValues={{ active: true }}
        >
          <Form.Item
            label="Stock Symbol"
            name="symbol"
            rules={[{ required: true, message: "Please select the stock" }]}
          >
            <Select
              showSearch
              placeholder="Search symbol..."
              filterOption={false}
              onSearch={debouncedFetchSymbols}
              loading={fetchingSymbols}
              options={symbols}
              notFoundContent={fetchingSymbols ? "Loading..." : "No symbols"}
            />
          </Form.Item>

          <Form.Item
            label="Condition"
            name="condition"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: "Above", label: "Price Above" },
                { value: "Below", label: "Price Below" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Target Price"
            name="price"
            rules={[{ required: true, message: "Please enter target price" }]}
          >
            <Input type="number" placeholder="e.g. 200" />
          </Form.Item>

          <Form.Item label="Note" name="note">
            <Input.TextArea rows={3} placeholder="Optional note about this alert" />
          </Form.Item>

          <Form.Item label="Active" name="active" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingAlert ? "Update" : "Add"}
              </Button>
              <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default AlertsPage;
