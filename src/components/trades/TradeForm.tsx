"use client";

import React, { useState, useEffect } from "react";
import { Form, Input, InputNumber, Select, Tabs, DatePicker, Rate, Switch, Row, Col } from "antd";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

export default function TradeForm({ form }: { form: any }) {
  const [symbols, setSymbols] = useState<{ value: string; label: string }[]>([]);
  const [fetching, setFetching] = useState(false);
  const [tradeStatus, setTradeStatus] = useState<string>("Open");

  // Keep tradeStatus in sync with form
  const statusValue = Form.useWatch("status", form);
  useEffect(() => {
    if (statusValue) setTradeStatus(statusValue);
  }, [statusValue]);

  // Mock server fetch function
  const fetchSymbols = async (query: string) => {
    if (!query) return;
    setFetching(true);
    try {
      const res = await fetch(`/api/v1/symbols?search=${query}`); // Using existing scanner API if available or mock
      // Fallback if scanner API not available/compatible yet, just return dummy or empty
      const data = await res.json();
      // Adjust based on actual API response, assuming it might be list of strings or objects
      const options = Array.isArray(data.data || data) ? (data.data || data).map((item: any) => ({
        value: typeof item === 'string' ? item : item.symbol,
        label: typeof item === 'string' ? item : item.symbol,
      })) : [];

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
      const positionType = form.getFieldValue("position_type") || "Long"; // Default Long

      let target = entry;
      if (positionType === "Long") {
        target = entry + risk * rr;
      } else {
        target = entry - risk * rr;
      }

      form.setFieldsValue({ target_price: Number(target.toFixed(2)) });
    }
  };

  const basicTab = (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="symbol"
            label="Symbol"
            rules={[{ required: true, message: "Please enter symbol" }]}
          >
            <Select
              showSearch
              placeholder="e.g. RELIANCE"
              filterOption={false}
              onSearch={fetchSymbols}
              loading={fetching}
              options={symbols}
              notFoundContent={fetching ? "Loading..." : null}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="date"
            label="Date & Time"
            initialValue={dayjs()}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="position_type" label="Position" initialValue="Long" rules={[{ required: true }]}>
            <Select style={{ width: "100%" }}>
              <Option value="Long">Long 🟢</Option>
              <Option value="Short">Short 🔴</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="trade_type" label="Type" initialValue="Intraday">
            <Select style={{ width: "100%" }}>
              <Option value="Scalp">Scalp</Option>
              <Option value="Intraday">Intraday</Option>
              <Option value="Swing">Swing</Option>
              <Option value="Positional">Positional</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="entry_price" label="Entry Price" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} step={0.05} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="stop_loss" label="Stop Loss" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} step={0.05} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="target_price" label="Target" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} step={0.05} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="rr" label="Quick R:R Calc (Optional)">
        <Select placeholder="Select R:R to auto-set Target" onChange={handleRRChange} style={{ width: "100%" }}>
          <Option value={1}>1:1</Option>
          <Option value={1.5}>1:1.5</Option>
          <Option value={2}>1:2</Option>
          <Option value={3}>1:3</Option>
        </Select>
      </Form.Item>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Form.Item name="status" label="Status" initialValue="Open">
            <Select onChange={setTradeStatus} style={{ width: "100%" }}>
              <Option value="Open">Open</Option>
              <Option value="Closed">Closed</Option>
              <Option value="Pending">Pending</Option>
              <Option value="SL Hit">SL Hit</Option>
              <Option value="Target Hit">Target Hit</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="timeframe" label="Timeframe">
            <Select placeholder="e.g. 5m" style={{ width: "100%" }}>
              <Option value="1m">1m</Option>
              <Option value="5m">5m</Option>
              <Option value="15m">15m</Option>
              <Option value="1h">1h</Option>
              <Option value="4h">4h</Option>
              <Option value="1D">1D</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  const planningTab = (
    <>
      <Form.Item name={['pre_trade', 'setup_name']} label="Setup Name" tooltip="e.g. Breakout, Reversal">
        <Input placeholder="Enter your setup name" />
      </Form.Item>

      <Form.Item name={['pre_trade', 'reason']} label="Reason for Trade">
        <TextArea rows={3} placeholder="Why are you taking this trade?" />
      </Form.Item>

      <Form.Item name={['pre_trade', 'confirmations']} label="Confirmations">
        <Select mode="tags" placeholder="e.g. RSI Div, Volume, EMA Cross" style={{ width: "100%" }} />
      </Form.Item>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Form.Item name={['pre_trade', 'risk_per_trade']} label="Risk Amount (₹)">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name={['pre_trade', 'zone']} label="Zone">
            <Input placeholder="e.g. Demand Zone 1H" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="tags" label="Tags">
        <Select mode="tags" placeholder="Add custom tags e.g. #news #nifty" style={{ width: "100%" }} />
      </Form.Item>
    </>
  );

  const reviewTab = (
    <>
      {tradeStatus === "Open" && <div style={{ marginBottom: 16, color: 'orange', fontSize: 13 }}>ℹ️ Mark trade as Closed/SL Hit/Target Hit to fill exit details.</div>}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Form.Item name="exit_price" label="Exit Price">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="exit_date" label="Exit Date">
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Form.Item name={['pnl', 'realised']} label="Realised PnL">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item name={['pnl', 'charges']} label="Charges">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item name={['pnl', 'net']} label="Net PnL">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name={['post_trade', 'followed_plan']} label="Followed Plan?" valuePropName="checked">
        <Switch checkedChildren="Yes" unCheckedChildren="No" />
      </Form.Item>

      <Form.Item name={['post_trade', 'emotions']} label="Emotions Felt">
        <Select mode="tags" placeholder="e.g. Fear, FOMO, Greed, Confident" style={{ width: "100%" }}>
          <Option value="Fear">Fear</Option>
          <Option value="Greed">Greed</Option>
          <Option value="FOMO">FOMO</Option>
          <Option value="Revenge">Revenge</Option>
          <Option value="Confident">Confident</Option>
          <Option value="Anxious">Anxious</Option>
        </Select>
      </Form.Item>

      <Form.Item name={['post_trade', 'mistakes']} label="Mistakes Made">
        <Select mode="tags" style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name={['post_trade', 'lessons']} label="Lessons Learned">
        <TextArea rows={2} />
      </Form.Item>

      <Form.Item name={['post_trade', 'rating']} label="Self Rating">
        <Rate />
      </Form.Item>
    </>
  );

  return (
    <Form form={form} layout="vertical">
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Trade Details" key="1">
          {basicTab}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Planning (Pre-Trade)" key="2">
          {planningTab}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Review (Post-Trade)" key="3">
          {reviewTab}
        </Tabs.TabPane>
      </Tabs>
    </Form>
  );
}
