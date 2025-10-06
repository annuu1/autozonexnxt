"use client";

import React from "react";
import { Modal, Form, Input, Select, DatePicker, Switch, message } from "antd";
import dayjs from "dayjs";

const { Option } = Select;

interface SubscriptionModalProps {
  open: boolean;
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  open,
  user,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        userId: user._id,
        plan: values.plan,
        amount: Number(values.amount),
        currency: values.currency || "INR",
        paymentMode: values.paymentMode || "UPI",
        expiryDate: values.expiryDate
          ? values.expiryDate.toISOString()
          : null,
        transactionId: values.transactionId || null,
        isAutoRenew: values.isAutoRenew || false,
        notes: values.notes || "",
      };

      const res = await fetch("/api/v1/users/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create subscription");
      }

      message.success("Subscription added successfully!");
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      message.error(error.message || "Failed to add subscription");
    }
  };

  return (
    <Modal
      title={`Add Subscription for ${user?.name || "User"}`}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Add"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="plan"
          label="Plan"
          rules={[{ required: true, message: "Please select plan" }]}
        >
          <Select placeholder="Select plan">
            <Option value="starter">Starter</Option>
            <Option value="pro">Pro</Option>
            <Option value="elite">Elite</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="billingCycle"
          label="Billing Cycle"
          rules={[{ required: true, message: "Please select billing cycle" }]}
        >
          <Select placeholder="Select billing cycle">
            <Option value="daily">Daily</Option>
            <Option value="weekly">Weekly</Option>
            <Option value="monthly">Monthly</Option>
            <Option value="quarterly">Quarterly</Option>
            <Option value="yearly">Yearly</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="amount"
          label="Amount"
          rules={[{ required: true, message: "Please enter amount" }]}
        >
          <Input type="number" placeholder="Enter amount (INR)" />
        </Form.Item>

        <Form.Item name="transactionId" label="Transaction ID (optional)">
          <Input placeholder="Enter transaction ID" />
        </Form.Item>

        {/* <Form.Item
          name="expiryDate"
          label="Expiry Date"
          rules={[{ required: true, message: "Please select expiry date" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            defaultValue={dayjs().add(30, "day")}
          />
        </Form.Item> */}

        <Form.Item name="isAutoRenew" label="Auto Renew" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="telegramUsername" label="Telegram Username (optional)">
          <Input placeholder="Enter Telegram username" />
        </Form.Item>

        <Form.Item name="telegramChatId" label="Telegram Chat ID (optional)">
          <Input placeholder="Enter Telegram chat ID" />
        </Form.Item>

        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={3} placeholder="Add internal notes (optional)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SubscriptionModal;
