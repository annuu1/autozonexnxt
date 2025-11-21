"use client"

import { useEffect, useState } from "react"
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Typography,
  Modal,
  Form,
  Input,
  Tabs,
  message,
  notification,
} from "antd"
import { EditOutlined, ReloadOutlined, LockOutlined, SendOutlined } from "@ant-design/icons"
import useAuthStore from "@/store/useAuthStore"
import OtherChannelsModal from "@/components/common/OtherChannelsModal"

const { Title } = Typography

export default function ProfilePage() {
  const { user, logout, setUser, refreshUser } = useAuthStore()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()

  // ⚡ AntD v5: context holders for toast notifications
  const [messageApi, contextHolder] = message.useMessage()
  const [notificationApi, notificationContextHolder] = notification.useNotification()

  if (!user) {
    return (
      <Card style={{ maxWidth: 500, margin: "2rem auto", textAlign: "center" }}>
        <Title level={4}>No user data found</Title>
        <Button type="primary" href="/v1/login">
          Go to Login
        </Button>
      </Card>
    )
  }

  // ✅ Update Profile
  const handleUpdateProfile = async (values: any) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/users/${user.id || user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update profile")

      setUser(data)
      messageApi.success("Profile updated successfully!")
      form.resetFields()
      setIsEditModalOpen(false)
    } catch (error: any) {
      messageApi.error(error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  // ✅ Change Password
  const handleChangePassword = async (values: any) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/users/${user.id || user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        // show inline field error
        passwordForm.setFields([
          {
            name: "currentPassword",
            errors: [data.error || "Invalid current password"],
          },
        ])
        throw new Error(data.error || "Failed to change password")
      }

      messageApi.success("Password changed successfully!")
      passwordForm.resetFields()
      setIsPasswordModalOpen(false)
    } catch (error: any) {
      if (!error.message.includes("Invalid")) {
        messageApi.error(error.message || "Something went wrong")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto" }}>
      {/* ⚡ Render context holders for toast notifications */}
      {contextHolder}
      {notificationContextHolder}

      <Card
        title={<Title level={3} style={{ marginBottom: 0 }}>User Dashboard</Title>}
        actions={[
          // <Button
          //   type="link"
          //   icon={<EditOutlined />}
          //   key="edit"
          //   onClick={() => setIsEditModalOpen(true)}
          // >
          //   Edit Profile
          // </Button>,
          <Button
            type="link"
            icon={<LockOutlined />}
            key="password"
            onClick={() => setIsPasswordModalOpen(true)}
          >
            Change Password
          </Button>,
          <Button
            type="link"
            icon={<SendOutlined />}
            key="telegram"
            onClick={() => setIsTelegramModalOpen(true)}
          >
            Update Telegram
          </Button>,
          // <Button
          //   type="link"
          //   icon={<ReloadOutlined />}
          //   key="refresh"
          //   onClick={() => window.location.reload()}
          // >
          //   Refresh
          // </Button>,
        ]}
      >
        <Tabs
          defaultActiveKey="profile"
          items={[
            {
              key: "profile",
              label: "Profile Info",
              children: (
                <Descriptions bordered column={1} size="middle">
                  <Descriptions.Item label="Name">{user.name}</Descriptions.Item>
                  <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                  <Descriptions.Item label="Roles">
                    {user.roles.map((role: string) => (
                      <Tag key={role} color={role === "admin" ? "red" : "blue"}>
                        {role}
                      </Tag>
                    ))}
                  </Descriptions.Item>
                  <Descriptions.Item label="Subscription">
                    {user.subscription ? (
                      <>
                        <b>Plan:</b> {user.subscription.plan} <br />
                        <b>Status:</b>{" "}
                        <Tag
                          color={
                            user.subscription.status === "active"
                              ? "green"
                              : "volcano"
                          }
                        >
                          {user.subscription.status}
                        </Tag>
                        <br />
                        <b>Billing:</b>{" "}
                        {user.subscription.billingCycle}
                        <br />
                        <b>Start Date:</b>{" "}
                        {new Date(
                          user.subscription.startDate
                        ).toLocaleDateString()}
                      </>
                    ) : (
                      "No active subscription"
                    )}
                  </Descriptions.Item>

                  {<Descriptions.Item label="Invited By">{user?.invitedBy?.name || "-"}</Descriptions.Item>}
                  <Descriptions.Item label="Other Contact">
                    {user.other_channels && user.other_channels.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {user.other_channels.map((ch: any) => (
                          <li key={ch.channel}>
                            <strong>{ch.channel}:</strong> {ch.id}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "No channels added"
                    )}
                  </Descriptions.Item>
                </Descriptions>
              ),
            },
          ]}
        />

        <Space style={{ marginTop: "1.5rem" }}>
          <Button type="primary" onClick={() => setIsEditModalOpen(true)}>
            Update Profile
          </Button>
          <Button danger onClick={logout}>
            Logout
          </Button>
        </Space>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        title="Update Profile"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false)
          form.resetFields()
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ name: user.name, email: user.email }}
          onFinish={handleUpdateProfile}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                Save Changes
              </Button>
              <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title="Change Password"
        open={isPasswordModalOpen}
        onCancel={() => {
          setIsPasswordModalOpen(false)
          passwordForm.resetFields()
        }}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[{ required: true, message: "Enter current password" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[{ required: true, message: "Enter new password" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(
                    new Error("Passwords do not match")
                  )
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                Change Password
              </Button>
              <Button onClick={() => setIsPasswordModalOpen(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      {/* Telegram Username Modal */}
      <OtherChannelsModal
        visible={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        channel="telegramUsername"
        title="Update Telegram Username"
        description="Add or update your Telegram username for easy support and seamless services."
        placeholder="Enter your Telegram username (without @)"
        initialValue={
          user?.other_channels?.find(
            (ch: any) => ch.channel === "telegramUsername"
          )?.id || ""
        }
        onSuccess={() => {
          messageApi.success("Telegram username updated successfully!")
          setIsTelegramModalOpen(false)
        }}
      />
    </div>
  )
}
