// app/v1/forgot-password/ForgotPasswordPage.tsx
"use client";

import { Card, Typography, Button, Space } from "antd";
import { TeamOutlined, MailOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export default function ForgotPasswordPage() {
  return (
    <div className="forgot-wrapper">
      <Card className="forgot-card">
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <Title level={3} style={{ fontWeight: 600 }}>
              Forgot Password?
            </Title>
            <Paragraph type="secondary">
              Don’t worry! You can reset your password manually by contacting
              the admin.
            </Paragraph>
          </div>

          <Paragraph>
            Please send a message to the admin on Telegram with your registered
            email. A temporary password will be created for you.
          </Paragraph>

          <div style={{ textAlign: "center" }}>
            <Button
              type="primary"
              icon={<TeamOutlined />}
              size="large"
              href="https://t.me/AnuragX_sys"
              target="_blank"
              style={{ marginBottom: 16 }}
            >
              Contact Admin on Telegram
            </Button>
            <Paragraph type="secondary">
              Make sure to provide your registered email in the message.
            </Paragraph>
          </div>
        </Space>
      </Card>

      <style jsx>{`
        .forgot-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: linear-gradient(135deg, #e0f7fa, #f5f7fa);
        }

        .forgot-card {
          width: 100%;
          max-width: 450px;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          padding: 32px;
          text-align: center;
          background: #ffffff;
        }

        @media (max-width: 480px) {
          .forgot-card {
            max-width: 100%;
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}
