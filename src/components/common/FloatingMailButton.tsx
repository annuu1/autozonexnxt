"use client";

import { useState } from "react";
import { Button, Modal, Input, message } from "antd";
import { CustomerServiceOutlined } from "@ant-design/icons";

const { TextArea } = Input;

export default function FloatingMailButton() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSend = () => {
    if (!msg.trim()) {
      message.warning("Please type a message before sending.");
      return;
    }

    const subject = encodeURIComponent("Contact Us – AutoZoneX Dashboard");
    const body = encodeURIComponent(
      `${msg.trim()}\n\n---\nSent from Dashboard`
    );
    const mailto = `mailto:autozonex@zohomail.in?subject=${subject}&body=${body}`;

    window.location.href = mailto;

    setOpen(false);
    setMsg("");
    message.success("Opening your mail client…");
  };

  return (
    <>
      {/* Floating Contact Us Button */}
      <Button
        type="primary"
        size="large"
        icon={<CustomerServiceOutlined style={{ fontSize: 18 }} />}
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 1000,
          borderRadius: 30,
          height: 48,
          padding: "0 20px",
          fontWeight: 600,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        Contact Us
      </Button>

      {/* Message Modal */}
      <Modal
        title={
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CustomerServiceOutlined /> Contact Support
          </span>
        }
        open={open}
        onCancel={() => {
          setOpen(false);
          setMsg("");
        }}
        onOk={handleSend}
        okText="Open Mail"
        cancelText="Cancel"
        width={420}
      >
        <TextArea
          rows={6}
          placeholder="Type your message here..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          autoFocus
          style={{ resize: "none" }}
        />
      </Modal>
    </>
  );
}