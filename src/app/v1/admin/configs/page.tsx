"use client";

import { useEffect, useState } from "react";
import { Table, Input, Button, Space, Popconfirm, message } from "antd";

export default function AdminConfigsPage() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  
  const [resetEmail, setResetEmail] = useState("");

  // Fetch all configs
  const fetchConfigs = async () => {
    const res = await fetch("/api/v1/admin/configs");
    const data = await res.json();
    setConfigs(data.configs || []);
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  // Update existing config
  const updateConfig = async (key: string, value: string) => {
    setLoading(true);
    const res = await fetch("/api/v1/admin/configs", {
      method: "POST",
      body: JSON.stringify({ key, value }),
    });
    setLoading(false);

    if (res.ok) {
      message.success("Updated");
      fetchConfigs();
    } else {
      message.error("Failed");
    }
  };

  //Reset password

  const resetUserPassword = async () => {
    if (!resetEmail.trim()) return message.error("Email required");
  
    const res = await fetch(`/api/v1/auth/reset-pass/${resetEmail}`, {
      method: "POST",
    });
  
    if (res.ok) {
      message.success(`Password reset to temp@123`);
      setResetEmail("");
    } else {
      const data = await res.json();
      message.error(data.error || "Failed to reset password");
    }
  };

  // Delete config
  const deleteConfig = async (key: string) => {
    const res = await fetch(`/api/v1/admin/configs?key=${key}`, {
      method: "DELETE",
    });

    if (res.ok) {
      message.success("Deleted");
      fetchConfigs();
    } else {
      message.error("Failed");
    }
  };

  // Add config
  const addConfig = async () => {
    if (!newKey.trim()) return message.error("Key required");

    const res = await fetch("/api/v1/admin/configs", {
      method: "POST",
      body: JSON.stringify({ key: newKey, value: newValue }),
    });

    if (res.ok) {
      message.success("Created");
      setNewKey("");
      setNewValue("");
      fetchConfigs();
    } else {
      message.error("Failed");
    }
  };

  // Local update before save
  const handleValueChange = (key: string, newVal: string) => {
    setConfigs((prev) =>
      prev.map((cfg) => (cfg.key === key ? { ...cfg, value: newVal } : cfg))
    );
  };

  const columns = [
    { title: "Key", dataIndex: "key" },

    {
      title: "Value",
      render: (_: any, record: any) => (
        <Input
          value={record.value}
          onChange={(e) => handleValueChange(record.key, e.target.value)}
          onBlur={(e) => updateConfig(record.key, e.target.value)}
        />
      ),
    },

    {
      title: "Actions",
      render: (_: any, record: any) => (
        <Popconfirm
          title="Delete config?"
          onConfirm={() => deleteConfig(record.key)}
        >
          <Button danger>Delete</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <h1>System Configurations</h1>


      {/* Reset User Password */}
<div style={{ marginBottom: 40 }}>
  <h2>Reset User Password</h2>

  <Space direction="vertical">
    <Input
      placeholder="User email"
      value={resetEmail}
      onChange={(e) => setResetEmail(e.target.value)}
      style={{ width: 300 }}
    />

    <Button type="primary" danger onClick={resetUserPassword}>
      Reset Password to temp@123
    </Button>
  </Space>
</div>

      {/* Create Config Section */}
      <Space direction="vertical" style={{ marginBottom: 20 }}>
        <Input
          placeholder="Config key (e.g., upstox_access_token)"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          style={{ width: 300 }}
        />

        <Input.TextArea
          placeholder="Value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          rows={4}
          style={{ width: 400 }}
        />

        <Button type="primary" onClick={addConfig}>
          Add Config
        </Button>
      </Space>

      <Table
        rowKey="key"
        dataSource={configs}
        columns={columns}
        loading={loading}
      />
    </div>
  );
}
