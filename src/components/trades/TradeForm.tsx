"use client";

import React, { useState } from "react";
import { Form, Input, InputNumber, Select } from "antd";

const { Option } = Select;

export default function TradeForm({ form }: { form: any }) {
  const [symbols, setSymbols] = useState<{ value: string; label: string }[]>([]);
  const [fetching, setFetching] = useState(false);

  // Mock server fetch function
  const fetchSymbols = async (query: string) => {
    if (!query) return;
    setFetching(true);

    try {
      const res = await fetch(`/api/v1/symbols?search=${query}`);
      const data = await res.json();

      const options = data.map((item: any) => ({
        value: item.symbol,
        label: item.symbol,
      }));

      setSymbols(options);
    } catch (err) {
      console.error("Error fetching symbols", err);
    } finally {
      setFetching(false);
    }
  };

  // Handle auto-calculation of target price based on R:R
  const handleRRChange = (rr: number) => {
    const entry = form.getFieldValue("entry_price");
    const stopLoss = form.getFieldValue("stop_loss");

    if (entry && stopLoss) {
      const risk = Math.abs(entry - stopLoss);
      const tradeType = form.getFieldValue("trade_type") || "BUY";

      let target = entry;
      if (tradeType === "BUY") {
        target = entry + risk * rr;
      } else {
        target = entry - risk * rr;
      }

      form.setFieldsValue({ target_price: Number(target.toFixed(2)) });
    }
  };

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        name="symbol"
        label="Symbol"
        rules={[{ required: true, message: "Please enter symbol" }]}
      >
        <Select
          showSearch
          placeholder="Type to search symbol"
          filterOption={false}
          onSearch={fetchSymbols}
          loading={fetching}
          options={symbols}
          notFoundContent={fetching ? "Loading..." : "No symbols found"}
        />
      </Form.Item>

      <Form.Item
        name="trade_type"
        label="Trade Type"
        rules={[{ required: true }]}
      >
        <Select defaultValue="BUY" placeholder="Select type">
          <Option value="BUY">BUY</Option>
          <Option value="SELL">SELL</Option>
        </Select>
      </Form.Item>

      {/* ✅ Quantity field */}
      <Form.Item
        name="quantity"
        label="Quantity"
        rules={[{ required: true, message: "Please enter quantity" }]}
      >
        <InputNumber
          min={1}
          style={{ width: "100%" }}
          placeholder="Number of units/lots"
        />
      </Form.Item>

      <Form.Item
        name="entry_price"
        label="Entry Price"
        rules={[{ required: true }]}
      >
        <InputNumber style={{ width: "100%" }} step={0.01} />
      </Form.Item>

      <Form.Item
        name="stop_loss"
        label="Stop Loss"
        rules={[{ required: true }]}
      >
        <InputNumber style={{ width: "100%" }} step={0.01} />
      </Form.Item>

      <Form.Item name="rr" label="Risk:Reward">
        <Select placeholder="Select R:R" onChange={handleRRChange}>
          <Option value={1}>1:1</Option>
          <Option value={2}>1:2</Option>
          <Option value={3}>1:3</Option>
          <Option value={4}>1:4</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="target_price"
        label="Target Price"
        rules={[{ required: true }]}
      >
        <InputNumber
          style={{ width: "100%" }}
          step={0.01}
          placeholder="Auto-calculated or enter manually"
        />
      </Form.Item>

      <Form.Item name="status" label="Status" initialValue="OPEN">
        <Select>
          <Option value="OPEN">OPEN</Option>
          <Option value="CLOSED">CLOSED</Option>
          <Option value="STOPPED">STOPPED</Option>
          <Option value="TARGET_HIT">TARGET HIT</Option>
        </Select>
      </Form.Item>

      <Form.Item name="note" label="Note">
        <Input.TextArea rows={3} placeholder="Optional note" />
      </Form.Item>
    </Form>
  );
}
