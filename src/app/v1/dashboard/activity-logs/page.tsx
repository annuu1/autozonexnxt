"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Table,
  Tag,
  Space,
  Typography,
  Select,
  Pagination,
  Spin,
  message,
} from "antd";

const { Title } = Typography;

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    userId: "",
    action: "",
    role: "",
  });

  const fetchLogs = async (pageNum = page, pageSize = limit) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: pageSize.toString(),
      });

      if (filters.userId) params.append("userId", filters.userId);
      if (filters.action) params.append("action", filters.action);

      const res = await fetch(`/api/v1/activity-logs?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch logs");

      setLogs(data.data);
      setTotal(data.pagination.total);
      setPage(data.pagination.page);
      setLimit(data.pagination.limit);
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.action, filters.userId]); // don't include role because it's frontend-only

  // Build role options dynamically from logs
  const roleOptions = useMemo(() => {
    const rolesSet = new Set<string>();
    logs.forEach((log) => {
      (log.user?.roles || []).forEach((role: string) => rolesSet.add(role));
    });
    return Array.from(rolesSet).map((role) => ({
      label: role.charAt(0).toUpperCase() + role.slice(1),
      value: role,
    }));
  }, [logs]);

  // Apply frontend-only filtering for role
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      let match = true;

      if (filters.role) {
        const roles = log.user?.roles || [];
        if (!roles.includes(filters.role)) {
          match = false;
        }
      }

      return match;
    });
  }, [logs, filters.role]);

  const columns = [
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      render: (user: any) =>
        user ? (
          <Space direction="vertical" size={0}>
            <span>
              <b>{user.name}</b> ({user.email || "-"})
            </span>
            <Tag color="blue">{user.roles?.join(", ") || "No Role"}</Tag>
            {user.subscription && (
              <Tag color="green">
                {user.subscription.plan} ({user.subscription.status})
              </Tag>
            )}
          </Space>
        ) : (
          <Tag color="red">Guest User</Tag>
        ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action: string) => <Tag>{action}</Tag>,
    },
    {
      title: "Endpoint",
      dataIndex: "endpoint",
      key: "endpoint",
    },
    {
      title: "Method",
      dataIndex: "method",
      key: "method",
      render: (method: string) => <Tag color="purple">{method}</Tag>,
    },
    {
      title: "IP Address",
      dataIndex: "ip",
      key: "ip",
    },
    {
      title: "User Agent",
      dataIndex: "userAgent",
      key: "userAgent",
      ellipsis: true,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div className="p-6">
      <Title level={3}>Activity Logs</Title>

      {/* Filters */}
      <div className="mb-4 flex gap-4 flex-wrap">
        <Select
          placeholder="Filter by Action"
          style={{ width: 200 }}
          allowClear
          onChange={(val) =>
            setFilters((f) => ({ ...f, action: val || "" }))
          }
          options={[
            { label: "Login", value: "LOGIN" },
            { label: "Logout", value: "LOGOUT" },
            { label: "Page Access", value: "ACCESS_PAGE" },
          ]}
        />

        <Select
          placeholder="Filter by Role"
          style={{ width: 200 }}
          allowClear
          onChange={(val) =>
            setFilters((f) => ({ ...f, role: val || "" }))
          }
          options={roleOptions}
        />
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey={(record) => record._id}
          pagination={false}
        />
      </Spin>

      <div className="mt-4 flex justify-end">
        <Pagination
          current={page}
          pageSize={limit}
          total={total}
          showSizeChanger
          onChange={(p, l) => fetchLogs(p, l)}
        />
      </div>
    </div>
  );
}
