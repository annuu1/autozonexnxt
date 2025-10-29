"use client";

import React, { useState } from "react";
import { Button, Input, Alert, Typography, Space, message } from "antd";
import { LinkOutlined, SendOutlined } from "@ant-design/icons";
import type { InputRef } from "antd";

const { Text, Paragraph, Title } = Typography;

interface TelegramSetupProps {
  onSubmit?: (chatId: string) => Promise<void>;
  initialChatId?: string;
  loading?: boolean;
}

const TelegramSetup: React.FC<TelegramSetupProps> = ({
  onSubmit,
  initialChatId = "",
  loading = false,
}) => {
  const [chatId, setChatId] = useState(initialChatId);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validateChatId = (value: string): boolean => {
    if (!value.trim()) {
      setError("Chat ID is required.");
      return false;
    }
    if (!/^-?\d+$/.test(value.trim())) {
      setError("Chat ID must be a valid integer (e.g., 123456789 or -1001234567890 for groups).");
      return false;
    }
    setError(null);
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setChatId(value);
    if (error) {
      validateChatId(value);
    }
  };

  const handleSubmit = async () => {
    if (!validateChatId(chatId)) return;

    if (onSubmit) {
      setSubmitting(true);
      try {
        await onSubmit(chatId.trim());
        message.success("Telegram chat ID saved successfully!");
      } catch (err) {
        message.error("Failed to save chat ID. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      <Alert
        message={<Title level={5}>Set up Telegram Notifications</Title>}
        description={
          <Space direction="vertical" style={{ width: "100%" }}>
            <Paragraph>
              To receive alerts in Telegram, you must set up your <Text strong>Telegram Chat ID</Text>.
              Note that your <Text code>username (e.g., @yourname)</Text> is not the same as your chat ID.
            </Paragraph>

            <Paragraph>
              <Text strong>Step 1:</Text> Open Telegram and search for <Text code>@userinfobot</Text>.
            </Paragraph>
            <Paragraph>
              <Text strong>Step 2:</Text> Send <Text code>/start</Text> to <Text code>@userinfobot</Text>. It will reply with your numeric chat ID.
            </Paragraph>
            <Paragraph>
              <Text strong>Step 3:</Text> Copy that numeric chat ID (e.g., <Text code>123456789</Text>) and paste it below.
              For groups, the ID usually starts with a minus sign (e.g., <Text code>-1001234567890</Text>).
            </Paragraph>

            <Paragraph>
              <Text strong type="danger">🚨 Important Step:</Text> After saving your Chat ID, 
              you <Text strong>must send a message</Text> to <Text code>@Myboy_1bot</Text> 
              in Telegram (just say “Hi” or anything).  
              <Text type="danger">The bot cannot send you alerts until you’ve messaged it first.</Text>
            </Paragraph>
          </Space>
        }
        type="info"
        showIcon
      />

      <Input
        ref={(inputRef: InputRef | null) => {
          if (inputRef && initialChatId) {
            inputRef.focus();
          }
        }}
        placeholder="Enter your Telegram chat ID (e.g., 123456789)"
        value={chatId}
        onChange={handleInputChange}
        status={error ? "error" : undefined}
        prefix={<LinkOutlined />}
        size="large"
        onPressEnter={handleSubmit}
      />

      {error && <Alert message={error} type="error" showIcon />}

      <Space wrap>
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={submitting || loading}
          disabled={!chatId.trim() || !!error}
          size="large"
        >
          Save Chat ID
        </Button>

        <Button
          type="default"
          href="https://t.me/Myboy_1bot"
          target="_blank"
          rel="noopener noreferrer"
          size="large"
          icon={<SendOutlined />}
        >
          Message AutoZoneX Bot
        </Button>

        <Button
          type="link"
          href="https://t.me/userinfobot"
          target="_blank"
          rel="noopener noreferrer"
          size="large"
          icon={<LinkOutlined />}
        >
          Open @userinfobot
        </Button>
      </Space>
    </Space>
  );
};

export default TelegramSetup;
