// components/common/OtherChannelsModal.tsx
"use client";

import { useState } from "react";
import { Modal, Input, Button } from "antd";
import useAuthStore from "@/store/useAuthStore";

interface OtherChannelsModalProps {
  visible: boolean;
  onClose: () => void;
  channel: string;
  title?: string;
  description?: string;
  placeholder?: string;
  onSuccess?: () => void;
}

export default function OtherChannelsModal({
  visible,
  onClose,
  channel,
  title = "Add Channel",
  description = "Enter your channel information.",
  placeholder = "Enter value",
  onSuccess,
}: OtherChannelsModalProps) {
  const [value, setValue] = useState("");
  const {refreshUser } = useAuthStore();

  const handleAdd = async () => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return;
    }

    try {
      const response = await fetch("/api/v1/users/otherChannels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel,
          id: trimmedValue,
        }),
      });

      if (response.ok) {
        onSuccess?.();
        setValue("");
        await refreshUser();
      } else {
        console.error("Failed to add channel");
      }
    } catch (error) {
      console.error("Error adding channel:", error);
    }
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onClose}
      footer={null}
      closable
      destroyOnHidden
    >
      <p>{description}</p>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" onClick={handleAdd} disabled={!value.trim()}>
          Add Channel
        </Button>
      </div>
    </Modal>
  );
}