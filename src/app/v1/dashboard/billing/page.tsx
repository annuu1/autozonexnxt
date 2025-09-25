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

  // Function to handle subscription button click
  const handleSubscribeClick = () => {
    window.location.href = "https://t.me/avninaina"
  }

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
                <Button type="primary" onClick={handleSubscribeClick}>
                  Upgrade Plan
                </Button>
                <Button onClick={() => alert("Cancel plan clicked")} danger disabled>
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
                onClick={handleSubscribeClick}
              >
                Subscribe Now
              </Button>
            </>
          )}
        </Space>
      </Card>

      {/* How to Get a Subscription */}
      <Card style={{ marginBottom: "2rem" }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Title level={4}>How to Get a Subscription</Title>
          <Text>
            To subscribe to our plan, please follow these steps:
          </Text>
          <ul>
            <li>Click the "Subscribe Now" button below to connect with our payment team.</li>
            <li>Complete the payment as instructed.</li>
            <li>
              Fill out the form below with the following details:
              <ul>
                <li>Your registered email</li>
                <li>Your phone number</li>
                <li>Your full name</li>
                <li>Screenshot or transaction ID of the payment</li>
              </ul>
            </li>
            <li>
              Once your payment and form submission are confirmed, you will receive{" "}
              <strong>instant access</strong> to your subscription, or it may take up to{" "}
              <strong>20 minutes</strong> in some cases.
            </li>
          </ul>
           <Button
            type="primary"
            style={{ marginTop: "1rem" }}
            onClick={handleSubscribeClick}
          >
            Subscribe Now
          </Button>

          <h2>Or fill form below</h2>

          {/* Embedded Google Form */}
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSfeZT-lIVkh7Iixrys-gB5X94r1ew6nR3yjnNnc3enYdc1Kzg/viewform?embedded=true"
            width="100%"
            height="1521"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            title="Subscription Payment Details Form"
            style={{ maxWidth: "640px", marginTop: "1rem" }}
          >
            Loading…
          </iframe>
          {/* Placeholder for future QR code */}
          {/* <img src="/path-to-qr-code.jpg" alt="QR Code for Payment" style={{ maxWidth: "200px", marginTop: "1rem" }} /> */}
        </Space>
      </Card>

      {/* Billing History */}
      {/* <Card>
        <Title level={4}>
          <CreditCardOutlined /> Billing History
        </Title>
        <Table
          columns={columns}
          dataSource={billingHistory}
          pagination={false}
          style={{ marginTop: "1rem" }}
        />
      </Card> */}
    </div>
  )
}