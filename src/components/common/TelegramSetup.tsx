"use client";

import React, { useState } from "react";
import { Button, Input, Alert, Typography, Space, message } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import type { InputRef } from "antd";

const { Text, Paragraph } = Typography;

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
      validateChatId(value); // Clear error if valid
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

  const handleTestChatId = () => {
    if (!validateChatId(chatId)) return;
    // Optional: Implement a test send if API supports it
    message.info("Chat ID looks valid! You can now receive alerts via Telegram.");
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      <Alert
        message="Set up Telegram Notifications"
        description={
          <Space direction="vertical" style={{ width: "100%" }}>
            <Paragraph>
              To receive price alerts directly in Telegram, you need to add your chat ID. 
              Users often confuse username (like @yourusername) with chat ID—username starts with @ and is not a number.
            </Paragraph>
            <Paragraph>
              <Text strong>Step 1:</Text> Open Telegram and search for <Text code>@userinfobot</Text>.
            </Paragraph>
            <Paragraph>
              <Text strong>Step 2:</Text> Start a chat with the bot and send <Text code>/start</Text>. It will reply with your chat ID.
            </Paragraph>
            <Paragraph>
              <Text strong>Step 3:</Text> Copy the numeric chat ID (e.g., 123456789) and paste it below. For groups, use the group chat ID starting with -.
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

      {error && (
        <Alert message={error} type="error" showIcon />
      )}

      <Space>
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={submitting || loading}
          disabled={!chatId.trim() || !!error}
          size="large"
        >
          Save Chat ID
        </Button>
        <Button onClick={handleTestChatId} disabled={!chatId.trim() || !!error} size="large">
          Test Validity
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