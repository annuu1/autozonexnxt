"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  Tag,
  Typography,
  Collapse,
  Image,
  Space,
  Spin,
  Alert,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  message,
  Modal,
  Upload,
  Popconfirm,
} from "antd";
import { PlusOutlined, MinusCircleOutlined, InboxOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { RcFile } from "antd/es/upload";
import dayjs from "dayjs";

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;
const { Dragger } = Upload;

type Trade = {
  _id: string;
  stock: string;
  status: "Entry Given" | "Running" | "Target Hit" | "Stoploss Hit" | "Analysis Only";
  analysis: string;
  images: string[];
  date: string;
  createdAt?: string;
};

const statusColorMap: Record<Trade["status"], string> = {
  "Entry Given": "blue",
  Running: "orange",
  "Target Hit": "green",
  "Stoploss Hit": "red",
  "Analysis Only": "purple",
};

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const pasteRef = useRef<HTMLDivElement>(null);

  // Fetch trades
  const fetchTrades = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/dashboard/tradeanalysis");
      const data = await res.json();
      if (data.success) {
        setTrades(data.data);
      } else {
        setError("Failed to fetch trades.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  // Add or Update Trade
  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        date: values.date ? values.date.toISOString() : new Date(),
      };

      let url = "/api/v1/dashboard/tradeanalysis";
      let method: "POST" | "PUT" = "POST";

      if (editingTrade) {
        url = `/api/v1/dashboard/tradeanalysis/${editingTrade._id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        message.success(editingTrade ? "Trade updated successfully!" : "Trade added successfully!");
        form.resetFields();
        setModalVisible(false);
        setEditingTrade(null);
        fetchTrades();
      } else {
        message.error("Failed to save trade.");
      }
    } catch (err) {
      message.error("Error submitting form.");
    }
  };

  // Delete Trade
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/dashboard/tradeanalysis/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        message.success("Trade deleted!");
        fetchTrades();
      } else {
        message.error("Failed to delete trade.");
      }
    } catch (err) {
      message.error("Error deleting trade.");
    }
  };

  // Paste screenshot from clipboard
  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) {
          uploadToImageKit(file);
        }
      }
    }
  };

  // Upload to ImageKit
  const uploadToImageKit = async (file: RcFile) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        const formData = new FormData();
        formData.append("file", base64);
        formData.append("fileName", file.name);

        const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
          method: "POST",
          headers: {
            Authorization: "Basic " + btoa(`${process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY}:`),
          },
          body: formData,
        });

        const data = await res.json();
        const currentImages = form.getFieldValue("images") || [];
        form.setFieldsValue({ images: [...currentImages, data.url] });
        message.success("Image uploaded from clipboard!");
      };
    } catch (err) {
      message.error("Upload failed");
      console.error(err);
    }
  };

  useEffect(() => {
    const div = pasteRef.current;
    if (div) div.addEventListener("paste", handlePaste as any);
    return () => {
      if (div) div.removeEventListener("paste", handlePaste as any);
    };
  }, []);

  // Open modal for edit
  const openEditModal = (trade: Trade) => {
    setEditingTrade(trade);
    form.setFieldsValue({
      ...trade,
      date: dayjs(trade.date),
    });
    setModalVisible(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Title level={2}>Trade Analysis</Title>
      <Paragraph type="secondary">
        Manage detailed trade analysis with charts across multiple timeframes. You can add, edit, or delete trades.
      </Paragraph>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        className="mb-6"
        onClick={() => {
          setEditingTrade(null);
          form.resetFields();
          setModalVisible(true);
        }}
      >
        Add New Trade
      </Button>

      {/* Modal */}
      <Modal
        title={editingTrade ? "Edit Trade Analysis" : "Add New Trade Analysis"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingTrade(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Stock"
            name="stock"
            rules={[{ required: true, message: "Please enter stock name" }]}
          >
            <Input placeholder="e.g. INFY" />
          </Form.Item>

          <Form.Item label="Status" name="status">
            <Select defaultValue="Analysis Only">
              <Select.Option value="Entry Given">Entry Given</Select.Option>
              <Select.Option value="Running">Running</Select.Option>
              <Select.Option value="Target Hit">Target Hit</Select.Option>
              <Select.Option value="Stoploss Hit">Stoploss Hit</Select.Option>
              <Select.Option value="Analysis Only">Analysis Only</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Analysis"
            name="analysis"
            rules={[{ required: true, message: "Please enter analysis" }]}
          >
            <Input.TextArea rows={4} placeholder="Detailed analysis..." />
          </Form.Item>

          <Form.List name="images">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} align="baseline" style={{ display: "flex", marginBottom: 8 }}>
                    <Form.Item {...restField} name={name}>
                      <Input placeholder="Image URL or paste/upload below" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Image URL
                  </Button>
                </Form.Item>

                <div ref={pasteRef} style={{ border: "1px dashed #d9d9d9", padding: 12, marginBottom: 12 }}>
                  <Dragger
                    accept="image/*"
                    multiple
                    showUploadList={false}
                    customRequest={({ file }) => uploadToImageKit(file as RcFile)}
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p>Drag & drop images here, click to upload, or paste from clipboard</p>
                  </Dragger>
                </div>
              </>
            )}
          </Form.List>

          <Form.Item label="Date" name="date" initialValue={dayjs()}>
            <DatePicker />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingTrade ? "Update Trade" : "Submit Trade"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Trades List */}
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {trades.map((trade) => (
          <Card
            key={trade._id}
            title={
              <Space>
                <span>{trade.stock}</span>
                <Tag color={statusColorMap[trade.status]}>{trade.status}</Tag>
              </Space>
            }
            extra={<span>{new Date(trade.date).toLocaleDateString()}</span>}
            style={{ width: "100%" }}
            actions={[
              <EditOutlined key="edit" onClick={() => openEditModal(trade)} />,
              <Popconfirm
                key="delete"
                title="Are you sure delete this trade?"
                onConfirm={() => handleDelete(trade._id)}
              >
                <DeleteOutlined />
              </Popconfirm>,
            ]}
          >
            <Collapse ghost>
              <Panel header="View Analysis" key="1">
                <Paragraph>{trade.analysis}</Paragraph>
                <Space wrap>
                  {trade.images.map((img, i) => (
                    <Image key={i} width={300} src={img} alt={`${trade.stock} timeframe ${i + 1}`} />
                  ))}
                </Space>
              </Panel>
            </Collapse>
          </Card>
        ))}
      </Space>
    </div>
  );
}
