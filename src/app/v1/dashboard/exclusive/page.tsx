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
  FloatButton,
  Tabs,
} from "antd";
import { PlusOutlined, MinusCircleOutlined, InboxOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { RcFile } from "antd/es/upload";
import dayjs from "dayjs";

import useAuthStore from "@/store/useAuthStore";

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const pasteRef = useRef<HTMLDivElement>(null);

  const { user } = useAuthStore();

  // Fetch trades
  const fetchTrades = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/dashboard/tradeanalysis", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setTrades(data.data);
      } else {
        setError(data.error || "Failed to fetch trades.");
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
      setSubmitting(true);
      const normalizedImages = Array.isArray(values.images)
        ? values.images.filter((img: string) => img && typeof img === "string")
        : values.images && typeof values.images === "string"
        ? [values.images]
        : [];

      const payload = {
        stock: values.stock,
        analysis: values.analysis,
        status: values.status || "Analysis Only",
        images: normalizedImages,
        date: values.date ? values.date.toISOString() : new Date().toISOString(),
      };

      console.log("Sending payload:", JSON.stringify(payload, null, 2)); // Debug log

      let url = "/api/v1/dashboard/tradeanalysis";
      let method: "POST" | "PUT" = "POST";

      if (editingTrade) {
        url = `/api/v1/dashboard/tradeanalysis/${editingTrade._id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
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
        message.error(data.error || "Failed to save trade.");
      }
    } catch (err: any) {
      message.error(err.message || "Error submitting form.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Trade
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/dashboard/tradeanalysis/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        message.success("Trade deleted!");
        fetchTrades();
      } else {
        message.error(data.error || "Failed to delete trade.");
      }
    } catch (err: any) {
      message.error(err.message || "Error deleting trade.");
    }
  };

  // Upload to ImageKit (Fixed: Append file directly, not base64)
  const uploadToImageKit = async (file: RcFile) => {
    try {
      const formData = new FormData();
      formData.append("file", file); // Append the actual file blob
      formData.append("fileName", file.name);

      const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY}:`)}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        const currentImages = form.getFieldValue("images") || [];
        form.setFieldsValue({ images: [...currentImages, data.url] });
        message.success("Image uploaded successfully!");
      } else {
        message.error("Image upload failed.");
      }
    } catch (err) {
      message.error("Upload failed.");
      console.error(err);
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
          uploadToImageKit(file as RcFile);
        }
      }
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
      stock: trade.stock,
      analysis: trade.analysis,
      status: trade.status,
      images: trade.images || [],
      date: trade.date ? dayjs(trade.date) : dayjs(),
    });
    setModalVisible(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  // Group trades by status and sort by date descending
  const statusGroups = trades.reduce((acc: Record<Trade["status"], Trade[]>, trade) => {
    acc[trade.status] = [...(acc[trade.status] || []), trade];
    return acc;
  }, {} as Record<Trade["status"], Trade[]>);

  Object.keys(statusGroups).forEach((status) => {
    statusGroups[status as Trade["status"]]?.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  const tabItems = Object.entries(statusGroups).map(([status, groupTrades]) => ({
    key: status,
    label: (
      <Space>
        <Tag color={statusColorMap[status as Trade["status"]]}>{status}</Tag>
        <span>({groupTrades.length})</span>
      </Space>
    ),
    children: (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupTrades.map((trade) => (
          <Card
            key={trade._id}
            title={
              <Space>
                <span className="font-semibold">{trade.stock}</span>
                <Tag color={statusColorMap[trade.status]}>{trade.status}</Tag>
              </Space>
            }
            extra={<span className="text-gray-500">{new Date(trade.date).toLocaleDateString()}</span>}
            className="shadow-md hover:shadow-lg transition-shadow rounded-lg"
            actions={
              user?.roles?.includes("admin") || user?.roles?.includes("manager")
                ? [
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => openEditModal(trade)}
                      key="edit"
                    >
                      Edit
                    </Button>,
                    <Popconfirm
                      key="delete"
                      title="Are you sure you want to delete this trade?"
                      onConfirm={() => handleDelete(trade._id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="text" icon={<DeleteOutlined />} danger>
                        Delete
                      </Button>
                    </Popconfirm>,
                  ]
                : []
            }
          >
            <Collapse ghost>
              <Panel header="View Analysis" key="1">
                <Paragraph style={{ whiteSpace: "pre-line" }} className="text-gray-700">
                  {trade.analysis}
                </Paragraph>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {trade.images.map((img, i) => (
                    <Image
                      key={i}
                      src={img}
                      alt={`${trade.stock} timeframe ${i + 1}`}
                      className="rounded-lg"
                      width="100%"
                      preview
                    />
                  ))}
                </div>
              </Panel>
            </Collapse>
          </Card>
        ))}
        {groupTrades.length === 0 && (
          <Alert message="No trades in this category yet." type="info" showIcon />
        )}
      </div>
    ),
  }));

  return (
    <div className="bg-gray-50 min-h-screen">
      <Title level={2} className="mb-2">Trade Analysis</Title>

      {/* Disclaimer Alert */}
      <Alert
        message="Important Disclaimer"
        description={
          <div>
            <p>
              We are not SEBI registered. All analysis shared here is for educational purposes only. Do not buy or
              sell any securities based solely on this information. Always conduct your own research and consult with
              a qualified financial advisor before making any investment decisions.
            </p>
          </div>
        }
        type="warning"
        showIcon
        className="mb-6"
      />
      <Paragraph type="secondary" className="mb-6">
        Explore and document in-depth technical analysis for stocks, incorporating annotated charts from multiple
        timeframes to capture nuanced market insights.
      </Paragraph>

      {/* Floating Action Button */}
      {(user?.roles?.includes("admin") || user?.roles?.includes("manager")) && (
        <FloatButton
          icon={<PlusOutlined />}
          type="primary"
          tooltip="Add New Trade"
          className="shadow-lg"
          onClick={() => {
            setEditingTrade(null);
            form.resetFields();
            setModalVisible(true);
          }}
        />
      )}

      {/* Modal */}
      <Modal
        title={editingTrade ? "Edit Trade Analysis" : "Add New Trade Analysis"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingTrade(null);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
        width={600}
        className="rounded-lg"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={submitting}
          className="space-y-4"
        >
          <Form.Item
            label="Stock"
            name="stock"
            rules={[{ required: true, message: "Please enter stock name" }]}
          >
            <Input placeholder="e.g. INFY" size="large" />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Please select a status" }]}
          >
            <Select size="large" placeholder="Select status">
              <Select.Option value="Analysis Only">Analysis Only</Select.Option>
              <Select.Option value="Entry Given">Entry Given</Select.Option>
              <Select.Option value="Running">Running</Select.Option>
              <Select.Option value="Target Hit">Target Hit</Select.Option>
              <Select.Option value="Stoploss Hit">Stoploss Hit</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Analysis"
            name="analysis"
            rules={[{ required: true, message: "Please enter analysis" }]}
          >
            <Input.TextArea rows={4} placeholder="Detailed analysis..." className="resize-none" />
          </Form.Item>

          <Form.List name="images">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} align="baseline" className="flex mb-4">
                    <Form.Item {...restField} name={name} className="flex-1">
                      <Input placeholder="Image URL" size="large" />
                    </Form.Item>
                    <Button
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                      danger
                      size="large"
                    />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                    size="large"
                    className="mb-4"
                  >
                    Add Image URL
                  </Button>
                </Form.Item>

                <div ref={pasteRef} className="border border-dashed border-gray-300 p-4 rounded-lg mb-4">
                  <Dragger
                    accept="image/*"
                    multiple
                    showUploadList={false}
                    customRequest={({ file }) => uploadToImageKit(file as RcFile)}
                    disabled={submitting}
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                      Drag & drop images, click to upload, or paste from clipboard
                    </p>
                  </Dragger>
                </div>

                {/* Image Preview */}
                <div className="grid grid-cols-2 gap-4">
                  {(form.getFieldValue("images") || []).map((url: string, index: number) => (
                    url && (
                      <div key={index} className="relative">
                        <Image
                          src={url}
                          alt={`Uploaded image ${index + 1}`}
                          className="rounded-lg"
                          width="100%"
                          preview
                        />
                        <Button
                          icon={<DeleteOutlined />}
                          danger
                          size="small"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            const currentImages = form.getFieldValue("images") || [];
                            form.setFieldsValue({
                              images: currentImages.filter((_: string, i: number) => i !== index),
                            });
                          }}
                        />
                      </div>
                    )
                  ))}
                </div>
              </>
            )}
          </Form.List>

          <Form.Item label="Date" name="date" initialValue={dayjs()}>
            <DatePicker size="large" className="w-full" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {editingTrade ? "Update Trade" : "Submit Trade"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Trades Tabs */}
      {trades.length === 0 ? (
        <div className="p-8 text-center">
          <Title level={4}>No trades yet</Title>
          <Paragraph>Start by adding your first trade analysis!</Paragraph>
        </div>
      ) : (
        <Tabs
          defaultActiveKey="Analysis Only"
          items={tabItems}
          className="mt-6"
          tabBarStyle={{ marginBottom: 24 }}
        />
      )}
    </div>
  );
}