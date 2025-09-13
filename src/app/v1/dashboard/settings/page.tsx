"use client"

import { Card, Divider, Switch, Typography, Button, Space, Select, Form, Input } from "antd"
import { LockOutlined, BellOutlined, GlobalOutlined } from "@ant-design/icons"
import useAuthStore from "@/store/useAuthStore" // adjust path if needed
import { useEffect } from "react"

const { Title, Text } = Typography

export default function SettingsPage() {
  const { user, setUser, logout } = useAuthStore()

  const [form] = Form.useForm()

  // Pre-fill the form with store values when user is available
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
      })
    }
  }, [user, form])

  const handleSaveAccount = (values: { name: string; email: string }) => {
    if (!user) return
    setUser({ ...user, ...values })
    alert("Account details updated")
  }

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto" }}>
      <Title level={2}>Settings</Title>

      {/* Account Section */}
      <Card style={{ marginBottom: "2rem" }}>
        <Title level={4}>Account</Title>
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: "1rem" }}
          onFinish={handleSaveAccount}
        >
          <Form.Item name="name" label="Name">
            <Input placeholder="Enter your name" />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input placeholder="Enter your email" />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
            <Button danger onClick={logout}>
              Deactivate Account
            </Button>
          </Space>
        </Form>
      </Card>

      {/* Security Section */}
      <Card style={{ marginBottom: "2rem" }}>
        <Title level={4}>
          <LockOutlined /> Security
        </Title>
        <Divider />
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button block onClick={() => alert("Change password clicked")}>
            Change Password
          </Button>
          <Button block onClick={() => alert("Enable 2FA clicked")}>
            Enable Two-Factor Authentication
          </Button>
        </Space>
      </Card>

      {/* Notifications Section */}
      <Card style={{ marginBottom: "2rem" }}>
        <Title level={4}>
          <BellOutlined /> Notifications
        </Title>
        <Divider />
        <Space direction="vertical" style={{ width: "100%" }}>
          <Space style={{ display: "flex", justifyContent: "space-between" }}>
            <Text>Email Notifications</Text>
            <Switch defaultChecked />
          </Space>
          <Space style={{ display: "flex", justifyContent: "space-between" }}>
            <Text>Push Notifications</Text>
            <Switch />
          </Space>
        </Space>
      </Card>

      {/* Preferences Section */}
      <Card>
        <Title level={4}>
          <GlobalOutlined /> Preferences
        </Title>
        <Divider />
        <Form layout="vertical">
          <Form.Item label="Language">
            <Select
              defaultValue="en"
              options={[
                { label: "English", value: "en" },
                { label: "Hindi", value: "hi" },
                { label: "Spanish", value: "es" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Theme">
            <Select
              defaultValue="light"
              options={[
                { label: "Light", value: "light" },
                { label: "Dark", value: "dark" },
                { label: "System", value: "system" },
              ]}
            />
          </Form.Item>
          <Button type="primary" onClick={() => alert("Preferences saved")}>
            Save Preferences
          </Button>
        </Form>
      </Card>
    </div>
  )
}
