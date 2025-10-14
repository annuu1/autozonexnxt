// components/AlertDrawer.tsx
import React, { useState, useCallback, useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Switch,
  Button,
  message,
} from "antd";
import debounce from "lodash.debounce";

import SymbolSelect from "@/components/common/SymbolSelect";
import type { Alert } from "./types";

interface AlertDrawerProps {
  open: boolean;
  editingAlert: Alert | null;
  onClose: () => void;
  onSubmit: (values: Partial<Alert>) => Promise<void>;
}

const AlertDrawer: React.FC<AlertDrawerProps> = ({
  open,
  editingAlert,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm<Partial<Alert>>();

  // Symbol search state (local to drawer)
  const [symbols, setSymbols] = useState<{ value: string; label: string }[]>([]);
  const [fetchingSymbols, setFetchingSymbols] = useState(false);

  // Debounced fetch for symbols
  const fetchSymbols = async (query: string) => {
    if (!query) return;
    setFetchingSymbols(true);
    try {
      const res = await fetch(`/api/v1/symbols?search=${query}`);
      const data = await res.json();

      const options = data.map((item: any) => ({
        value: item.symbol,
        label: item.symbol,
      }));
      setSymbols(options);
    } catch (err) {
      console.error("Error fetching symbols:", err);
    } finally {
      setFetchingSymbols(false);
    }
  };

  const debouncedFetchSymbols = useCallback(debounce(fetchSymbols, 400), []);

  // Reset and set initial values when drawer opens or editingAlert changes
  useEffect(() => {
    if (open) {
      if (editingAlert) {
        // For edit: set values
        form.setFieldsValue(editingAlert);
        // Optionally refetch symbols for the current symbol
        if (editingAlert.symbol) {
          debouncedFetchSymbols(editingAlert.symbol);
        }
      } else {
        // For add: reset and set defaults
        form.resetFields();
        form.setFieldsValue({ active: true });
      }
    }
  }, [open, editingAlert, form, debouncedFetchSymbols]);

  const handleSubmit = async (values: Partial<Alert>) => {
    try {
      await onSubmit(values);
      // Reset symbols on success
      setSymbols([]);
    } catch (error) {
      // Error handled in parent
    }
  };

  const handleClose = () => {
    // Reset form and symbols on close
    form.resetFields();
    setSymbols([]);
    onClose();
  };

  return (
    <Drawer
      title={editingAlert ? "Edit Alert" : "Add Alert"}
      open={open}
      onClose={handleClose}
      width={380}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Stock Symbol"
          name="symbol"
          rules={[{ required: true, message: "Please select the stock" }]}
        >
          <SymbolSelect
            options={symbols}
            onSearch={debouncedFetchSymbols}
            loading={fetchingSymbols}
          />
        </Form.Item>

        <Form.Item
          label="Condition"
          name="condition"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { value: "Above", label: "Price Above" },
              { value: "Below", label: "Price Below" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Target Price"
          name="price"
          rules={[{ required: true, message: "Please enter target price" }]}
        >
          <Input type="number" placeholder="e.g. 200" />
        </Form.Item>

        <Form.Item label="Note" name="note">
          <Input.TextArea rows={3} placeholder="Optional note about this alert" />
        </Form.Item>

        <Form.Item label="Active" name="active" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              {editingAlert ? "Update" : "Add"}
            </Button>
            <Button onClick={handleClose}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AlertDrawer;