"use client"

import { Card, Table, Tag, Button, Typography, Space } from "antd"
import { CreditCardOutlined, CrownOutlined } from "@ant-design/icons"
import useAuthStore from "@/store/useAuthStore"

const { Title, Text } = Typography

export default function BillingPage() {
  const { user } = useAuthStore()

  // Mock billing history (replace with API data later)
  const billingHistory = [
    {
      key: "1",
      date: "2025-09-10",
      amount: "$10.00",
      status: "paid",
      invoice: "#INV-001",
    },
    {
      key: "2",
      date: "2025-08-10",
      amount: "$10.00",
      status: "paid",
      invoice: "#INV-002",
    },
  ]

  const columns = [
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Invoice", dataIndex: "invoice", key: "invoice" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "paid" ? "green" : "volcano"}>{status}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Button type="link" onClick={() => alert("Download invoice clicked")}>
          Download
        </Button>
      ),
    },
  ]

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto" }}>
      <Title level={2}>Billing</Title>

      {/* Current Plan */}
      <Card style={{ marginBottom: "2rem" }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Title level={4}>
            <CrownOutlined /> Current Plan
          </Title>
          {user?.subscription ? (
            <>
              <Text strong>{user.subscription.plan.toUpperCase()}</Text>
              <Tag color={user.subscription.status === "active" ? "green" : "volcano"}>
                {user.subscription.status}
              </Tag>
              <Text>
                Started on{" "}
                {new Date(user.subscription.startDate).toLocaleDateString()}
              </Text>
              <Space style={{ marginTop: "1rem" }}>
                <Button type="primary" onClick={() => alert("Upgrade plan clicked")}>
                  Upgrade Plan
                </Button>
                <Button onClick={() => alert("Cancel plan clicked")} danger>
                  Cancel Subscription
                </Button>
              </Space>
            </>
          ) : (
            <>
              <Text>No active subscription</Text>
              <Button
                type="primary"
                style={{ marginTop: "1rem" }}
                onClick={() => alert("Subscribe now clicked")}
              >
                Subscribe Now
              </Button>
            </>
          )}
        </Space>
      </Card>

      {/* Billing History */}
      <Card>
        <Title level={4}>
          <CreditCardOutlined /> Billing History
        </Title>
        <Table
          columns={columns}
          dataSource={billingHistory}
          pagination={false}
          style={{ marginTop: "1rem" }}
        />
      </Card>
    </div>
  )
}
