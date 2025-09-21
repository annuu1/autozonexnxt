"use client";

import React, { useEffect, useState } from "react";
import { Table, Tag, Space, Button, Popconfirm, message, Modal, Form, Input, Select, Switch } from "antd";
import type { ColumnsType } from "antd/es/table";

interface Subscription {
  plan: string;
  status: string;
  cycle: string;
  startDate: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  isVerified: boolean;
  subscription: Subscription;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

const { Option } = Select;

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/users", { cache: "no-store" });
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
          },
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      message.success("User updated");
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      message.error("Update failed");
    }
  };

  const columns: ColumnsType<User> = [
    { title: "Name", dataIndex: "name", key: "name", render: (text) => <b>{text}</b> },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Mobile", dataIndex: "mobile", key: "mobile" },
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
    {
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
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

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
        </Form>
      </Modal>
    </>
  );
};

export default UsersPage;
