// components/alerts/QuickAlertModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Space,
} from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import SymbolSelect from "@/components/common/SymbolSelect";
import debounce from "lodash.debounce";

interface QuickAlertModalProps {
  open?: boolean;
  onClose?: () => void;
  initialSymbol?: string;
  triggerButton?: React.ReactNode; // Optional custom trigger
  showDefaultTrigger?: boolean;
}

const QuickAlertModal: React.FC<QuickAlertModalProps> = ({
  open: controlledOpen,
  onClose,
  initialSymbol = "",
  triggerButton,
  showDefaultTrigger=false,
}) => {
  const [form] = Form.useForm();
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [symbols, setSymbols] = useState<{ value: string; label: string }[]>([]);
  const [fetching, setFetching] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  // Sync initial symbol
  useEffect(() => {
    if (isOpen && initialSymbol) {
      form.setFieldsValue({ symbol: initialSymbol });
    }
  }, [initialSymbol, isOpen, form]);

  // Fetch symbols
  const fetchSymbols = async (query: string) => {
    if (!query.trim()) {
      setSymbols([]);
      return;
    }
    setFetching(true);
    try {
      const res = await fetch(`/api/v1/symbols?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      const options = data.map((item: any) => ({
        value: item.symbol,
        label: item.symbol,
      }));
      setSymbols(options);
    } catch (err) {
      console.error("Failed to fetch symbols", err);
    } finally {
      setFetching(false);
    }
  };

  const debouncedFetch = debounce(fetchSymbols, 400);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        symbol: values.symbol,
        condition: "Below",
        price: values.price,
        note: values.note || "",
        active: true,
      };

      const res = await fetch("/api/v1/dashboard/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create alert");

      message.success("Quick alert created!");
      form.resetFields();
      onClose?.();
      if (!isControlled) setInternalOpen(false);
    } catch (error) {
      message.error("Failed to create alert");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    if (!isControlled) setInternalOpen(true);
    onClose?.();
  };

  const handleClose = () => {
    form.resetFields();
    setSymbols([]);
    onClose?.();
    if (!isControlled) setInternalOpen(false);
  };

  const defaultTrigger = (
    <Button
      type="primary"
      icon={<ThunderboltOutlined />}
      style={{
        borderRadius: 30,
        height: 48,
        padding: "0 20px",
        fontWeight: 600,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      Quick Alert
    </Button>
  );

  return (
    <>
      {/* Trigger */}
      {triggerButton ? (
        <div onClick={handleOpen}>{triggerButton}</div>
      ) : (
        showDefaultTrigger && defaultTrigger
      )}

      {/* Modal */}
      <Modal
        title={
          <Space>
            <ThunderboltOutlined style={{ color: "#1890ff" }} />
            Quick Alert
          </Space>
        }
        open={isOpen}
        onCancel={handleClose}
        footer={null}
        width={400}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            condition: "Below",
            active: true,
          }}
        >
          <Form.Item
            label="Symbol"
            name="symbol"
            rules={[{ required: true, message: "Select a symbol" }]}
          >
            <SymbolSelect
              placeholder="Type to search..."
              options={symbols}
              onSearch={debouncedFetch}
              loading={fetching}
            />
          </Form.Item>

          <Form.Item
            label="Target Price"
            name="price"
            rules={[{ required: true, message: "Enter price" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="e.g. 1750"
              min={0}
              step={0.01}
            />
          </Form.Item>

          <Form.Item label="Note (optional)" name="note">
            <Input.TextArea rows={2} placeholder="Any note..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Alert
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default QuickAlertModal;