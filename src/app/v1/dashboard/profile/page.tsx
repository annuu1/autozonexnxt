"use client"

import { Card, Descriptions, Button, Space, Tag, Typography } from "antd"
import { EditOutlined, ReloadOutlined } from "@ant-design/icons"
import useAuthStore from "@/store/useAuthStore"

const { Title } = Typography

export default function ProfilePage() {
  const { user, logout } = useAuthStore()

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

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto" }}>
      <Card
        title={<Title level={3} style={{ marginBottom: 0 }}>Profile</Title>}
        actions={[
          <Button type="link" icon={<EditOutlined />} key="edit">
            Edit Profile
          </Button>,
          <Button type="link" icon={<ReloadOutlined />} key="refresh">
            Refresh
          </Button>,
        ]}
      >
        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label="Name">{user.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Roles">
            {user.roles.map((role) => (
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
                <Tag color={user.subscription.status === "active" ? "green" : "volcano"}>
                  {user.subscription.status}
                </Tag>
                <br />
                <b>Start Date:</b>{" "}
                {new Date(user.subscription.startDate).toLocaleDateString()}
              </>
            ) : (
              "No active subscription"
            )}
          </Descriptions.Item>
        </Descriptions>

        <Space style={{ marginTop: "1.5rem" }}>
          <Button type="primary" onClick={() => alert("Update profile will be implemented later")}>
            Update Profile
          </Button>
          <Button danger onClick={logout}>
            Logout
          </Button>
        </Space>
      </Card>
    </div>
  )
}
