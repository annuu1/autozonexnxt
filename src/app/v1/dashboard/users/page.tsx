"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Popconfirm,
  message,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  DatePicker,
  Card,
  List,
  Grid,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import moment from "moment-timezone";
import { useRoleAccess } from "@/hooks/hasRoleAccess";
import useAuthStore from "@/store/useAuthStore";

interface Subscription {
  plan: string;
  status: string;
  billingCycle: string;
  startDate: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  roles: string[];
  isVerified: boolean;
  subscription: Subscription;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  invitedBy?: { _id: string; name: string; email: string };
}

const { Option } = Select;
const { useBreakpoint } = Grid;

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const [search, setSearch] = useState("");
  const [invitedBy, setInvitedBy] = useState<string | undefined>(undefined);

  const { user: currentUser } = useAuthStore();
  const { allowed: canManageUsers } = useRoleAccess("userActions", currentUser);

  const screens = useBreakpoint();

  useEffect(() => {
    fetchUsers();
  }, [search, invitedBy]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (invitedBy) params.append("invitedBy", invitedBy);

      const res = await fetch(`/api/v1/users?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch {
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      message.success("User deleted");
      fetchUsers();
    } catch {
      message.error("Failed to delete user");
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      roles: user.roles,
      isVerified: user.isVerified,
      plan: user.subscription?.plan,
      status: user.subscription?.status,
      startDate: user.subscription?.startDate ? moment(user.subscription.startDate) : null,
      billingCycle: user.subscription?.billingCycle || "",
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const res = await fetch(`/api/v1/users/${editingUser?._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingUser,
          ...values,
          subscription: {
            ...editingUser?.subscription,
            plan: values.plan,
            status: values.status,
            startDate: values.startDate?.toISOString(),
            billingCycle: values.billingCycle,
          },
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      message.success("User updated");
      setIsModalOpen(false);
      fetchUsers();
    } catch {
      message.error("Update failed");
    }
  };

  const columns: ColumnsType<User> = [
    { title: "Name", dataIndex: "name", key: "name", render: (text) => <b>{text}</b> },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Mobile", dataIndex: "mobile", key: "mobile" },
    {
      title: "Invited By",
      dataIndex: "invitedBy",
      key: "invitedBy",
      render: (invitedBy) => invitedBy ? `${invitedBy.name} (${invitedBy.email})` : "—",
    },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      render: (roles) =>
        roles.map((role: string) => (
          <Tag color={role === "admin" ? "red" : "blue"} key={role}>
            {role.toUpperCase()}
          </Tag>
        )),
    },
    {
      title: "Subscription",
      key: "subscription",
      render: (_, record) => (
        <Tag color={record.subscription?.status === "active" ? "green" : "volcano"}>
          {record.subscription?.plan || "none"}
        </Tag>
      ),
    },
    {
      title: "Verified",
      dataIndex: "isVerified",
      key: "isVerified",
      render: (verified) => (
        <Tag color={verified ? "green" : "orange"}>{verified ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Last Login",
      dataIndex: "lastLogin",
      key: "lastLogin",
      render: (date) => (date ? new Date(date).toLocaleString() : "Never"),
    },
  ];

  if (canManageUsers) {
    columns.push({
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure delete this user?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    });
  }

  return (
    <>
      {/* Search + Filter */}
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search by name, email, or mobile"
          allowClear
          onSearch={(val) => setSearch(val)}
          style={{ width: 250 }}
        />
        <Select
          placeholder="Filter by Invited By"
          allowClear
          style={{ width: 200 }}
          onChange={(val) => setInvitedBy(val)}
        >
          {users
            .filter((u) => u.invitedBy)
            .map((u) => (
              <Option key={u.invitedBy!._id} value={u.invitedBy!._id}>
                {u.invitedBy!.name}
              </Option>
            ))}
        </Select>
      </Space>

      {/* Desktop → Table | Mobile → Card List */}
      {screens.md ? (
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      ) : (
        <List
          loading={loading}
          dataSource={users}
          renderItem={(user) => (
            <Card
              key={user._id}
              style={{ marginBottom: 16 }}
              title={user.name}
              extra={
                canManageUsers && (
                  <Space>
                    <Button size="small" onClick={() => handleEdit(user)}>Edit</Button>
                    <Popconfirm
                      title="Are you sure delete this user?"
                      onConfirm={() => handleDelete(user._id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button size="small" danger>
                        Delete
                      </Button>
                    </Popconfirm>
                  </Space>
                )
              }
            >
              <p><b>Email:</b> {user.email}</p>
              <p><b>Mobile:</b> {user.mobile}</p>
              <p><b>Roles:</b> {user.roles.map((r) => <Tag key={r}>{r}</Tag>)}</p>
              <p>
                <b>Subscription:</b>{" "}
                <Tag color={user.subscription?.status === "active" ? "green" : "volcano"}>
                  {user.subscription?.plan || "none"}
                </Tag>
              </p>
              <p><b>Verified:</b> {user.isVerified ? "✅ Yes" : "❌ No"}</p>
              <p><b>Last Login:</b> {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}</p>
              {user.invitedBy && (
                <p><b>Invited By:</b> {user.invitedBy.name} ({user.invitedBy.email})</p>
              )}
            </Card>
          )}
        />
      )}

      {/* Edit Modal */}
      <Modal
        title="Edit User"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleUpdate}
        okText="Update"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="roles" label="Roles">
            <Select mode="multiple">
              <Option value="user">User</Option>
              <Option value="associate">Associate</Option>
              <Option value="manager">Manager</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
          <Form.Item name="isVerified" label="Verified" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="plan" label="Plan">
            <Select>
              <Option value="starter">Starter</Option>
              <Option value="pro">Pro</Option>
              <Option value="freemium">Freemium</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Subscription Status">
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
          <Form.Item name="startDate" label="Subscription Start Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
            <Form.Item name="billingCycle" label="Billing Cycle" rules={[{ required: true }]}>
              <Select>
                <Option value="daily">Daily</Option>
                <Option value="weekly">Weekly</Option>
                <Option value="monthly">Monthly</Option>
                <Option value="quarterly">Quarterly</Option>
                <Option value="yearly">Yearly</Option>
              </Select>
            </Form.Item>

        </Form>
      </Modal>
    </>
  );
};

export default UsersPage;
