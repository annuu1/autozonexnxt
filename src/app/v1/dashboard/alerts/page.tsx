"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Button,
  Col,
  Input,
  Pagination,
  Row,
  Tabs,
  message,
  Spin,
  Modal,
} from "antd";
import {
  PlusOutlined,
  BellOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import debounce from "lodash.debounce";
import type { TabsProps } from "antd";

import AlertCard from "@/components/alerts/AlertCard";
import AlertDrawer from "@/components/alerts/AlertDrawer";
import TelegramSetup from "@/components/common/TelegramSetup";
import useAuthStore from "@/store/useAuthStore";
import type { Alert } from "@/components/alerts/types";

const { Search } = Input;

const AlertsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active"); // Default to 'active'
  const [showSetupModal, setShowSetupModal] = useState(false);

  const telegramChannel = useMemo(
    () => user?.other_channels?.find((ch: any) => ch.channel === "telegramChatId"),
    [user]
  );
  const chatId = telegramChannel?.id || null;

  if (!user) {
    return (
      <div style={{ padding: "24px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Spin size="large" />
      </div>
    );
  }

  // Show setup modal if no chat ID
  useEffect(() => {
    if (!chatId) {
      setShowSetupModal(true);
    }
  }, [chatId]);

  // Save Telegram chat ID
  const handleSaveChatId = async (newChatId: string) => {
    try {
      const existingIndex = user.other_channels?.findIndex((ch: any) => ch.channel === "telegramChatId") || -1;
      const updatedChannels = [...(user.other_channels || [])];
      if (existingIndex > -1) {
        updatedChannels[existingIndex] = { channel: "telegramChatId", id: newChatId };
      } else {
        updatedChannels.push({ channel: "telegramChatId", id: newChatId });
      }

      const res = await fetch("/api/v1/users/otherChannels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "telegramChatId", id: newChatId }),
      });
      if (!res.ok) throw new Error("Failed to save chat ID");

      // updateUser({ ...user, other_channels: updatedChannels });
      message.success("Telegram setup completed! You can now create alerts.");
    } catch (error) {
      console.error("Save chat ID error:", error);
      throw error;
    }
  };

  // Fetch alerts from API with pagination, search, and status filter
  const fetchAlerts = async (
    page = current,
    limit = pageSize,
    status = activeTab,
    search = searchTerm
  ) => {
    try {
      setLoading(true);
      let url = `/api/v1/dashboard/alert?page=${page}&limit=${limit}`;
      if (status && status !== "all") {
        url += `&status=${status}`;
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const res = await fetch(url);
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

  // Debounced search handler (now only on button/Enter)
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
      setCurrent(1); // Reset to first page on search
      fetchAlerts(1, pageSize, activeTab, value);
    }, 300),
    [activeTab, pageSize]
  );

  useEffect(() => {
    if (chatId !== null) {
      fetchAlerts();
    }
  }, [chatId]);

  // Reset page and refetch on tab change
  const onTabChange = (key: string) => {
    setActiveTab(key);
    setCurrent(1);
    setSearchTerm(""); // Clear search on tab switch
    fetchAlerts(1, pageSize, key, "");
  };

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
      await fetchAlerts(nextPage, pageSize, activeTab, searchTerm);

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
      await fetchAlerts(nextPage, pageSize, activeTab, searchTerm);
      
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
      // Refetch to update pagination if needed
      fetchAlerts(current, pageSize, activeTab, searchTerm);
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
    fetchAlerts(page, size || pageSize, activeTab, searchTerm);
  };

  // Open drawer for add/edit
  const openDrawer = (alert?: Alert) => {
    if (!chatId) {
      message.warning("Please set up Telegram notifications first.");
      setShowSetupModal(true);
      return;
    }
    setEditingAlert(alert || null);
    setDrawerOpen(true);
  };

  const tabItems: TabsProps['items'] = [
    {
      key: "all",
      label: `All Alerts`,
      children: (
        <Spin spinning={loading}>
          <div>
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
          </div>
        </Spin>
      ),
    },
    {
      key: "active",
      label: `Active Alerts`,
      children: (
        <Spin spinning={loading}>
          <div>
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
                    `${range[0]}-${range[1]} of ${totalCount} active alerts`
                  }
                />
              </div>
            )}
          </div>
        </Spin>
      ),
    },
    {
      key: "inactive",
      label: `Inactive Alerts`,
      children: (
        <Spin spinning={loading}>
          <div>
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
                    `${range[0]}-${range[1]} of ${totalCount} inactive alerts`
                  }
                />
              </div>
            )}
          </div>
        </Spin>
      ),
    },
  ];

  return (
    <>
      <div style={{ padding: "24px", position: "relative" }}>
        <h2 style={{ marginBottom: 16, fontWeight: 600 }}>📢 Price Alerts</h2>

        

        {!chatId && (
          <div style={{ marginBottom: 16, padding: 12, backgroundColor: "#fff3cd", borderRadius: 8, border: "1px solid #ffeaa7" }}>
            <BellOutlined style={{ color: "#856404", marginRight: 8 }} />
            <span style={{ color: "#856404" }}>Set up Telegram to receive alerts. <Button type="link" onClick={() => setShowSetupModal(true)}>Configure now</Button></span>
          </div>
        )}

        {/* Search Bar */}
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="Search alerts by symbol or note..."
            prefix={<SearchOutlined />}
            onSearch={debouncedSearch}  // Only triggers on Enter or button click
            allowClear
            style={{ width: 300 }}
            enterButton
          />
        </div>

        {/* Tabs */}
        <Tabs activeKey={activeTab} onChange={onTabChange} items={tabItems} />

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
          disabled={!chatId}
        />

        {/* Drawer */}
        <AlertDrawer
          open={drawerOpen}
          editingAlert={editingAlert}
          onClose={() => setDrawerOpen(false)}
          onSubmit={handleAddOrEdit}
        />
      </div>

      <Modal
        title="Set Up Telegram Notifications"
        open={showSetupModal}
        onCancel={() => setShowSetupModal(false)}
        footer={null}
        width={600}
      >
        <TelegramSetup
          onSubmit={async (newChatId: string) => {
            await handleSaveChatId(newChatId);
            setShowSetupModal(false);
          }}
          initialChatId=""
        />
      </Modal>
    </>
  );
};

export default AlertsPage;