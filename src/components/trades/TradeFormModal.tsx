"use client";

import React, { useState } from "react";
import { Modal, Form, Button, message } from "antd";
import TradeForm from "./TradeForm";

export default function TradeFormModal({
  onSuccess,
  trigger,
}: {
  onSuccess?: () => void;
  trigger?: React.ReactNode; // custom button if needed
}) {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const res = await fetch("/api/v1/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to add trade");

      message.success("Trade added successfully!");
      form.resetFields();
      setVisible(false);

      if (onSuccess) onSuccess();
    } catch (err) {
      message.error("Error adding trade");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {trigger ? (
        <span onClick={() => setVisible(true)}>{trigger}</span>
      ) : (
        <Button type="primary" onClick={() => setVisible(true)}>
         <span style={{ marginRight: 8, fontSize: 16, fontWeight: "bold", color: "#fff" }}>+</span> Add
        </Button>
      )}

      <Modal
        title="Add Trade"
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={handleSubmit}
        okText="Save"
        confirmLoading={loading}
        destroyOnClose
      >
        <TradeForm form={form} />
      </Modal>
    </>
  );
}
