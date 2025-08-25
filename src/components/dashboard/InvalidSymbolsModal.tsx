"use client";
import { Modal, Table, Button, Space, Input, Popconfirm, Tag } from "antd";

export default function InvalidSymbolsModal({
  open,
  onClose,
  data,
  loading,
  editingId,
  editingSymbol,
  setEditingId,
  setEditingSymbol,
  handleUpdateSymbol,
  handleDeleteSymbol,
}: any) {
  const invalidColumns = [
    {
      title: "Symbol",
      dataIndex: "symbol",
      key: "symbol",
      render: (_: any, record: any) =>
        editingId === record._id ? (
          <Input
            defaultValue={record.symbol}
            onChange={(e) => setEditingSymbol(e.target.value)}
          />
        ) : (
          record.symbol
        ),
    },
    { title: "Company", dataIndex: "company_name", key: "company_name" },
    { title: "Last Updated", dataIndex: "updated_at", key: "updated_at" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => (
        <Tag color={s === "active" ? "green" : "red"}>{s}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) =>
        editingId === record._id ? (
          <Space>
            <Button type="primary" onClick={() => handleUpdateSymbol(record)}>
              Save
            </Button>
            <Button onClick={() => setEditingId(null)}>Cancel</Button>
          </Space>
        ) : (
          <Space>
            <Button
              type="link"
              onClick={() => {
                setEditingId(record._id);
                setEditingSymbol(record.symbol);
              }}
            >
              Edit
            </Button>
            <Popconfirm
              title="Are you sure delete this symbol?"
              onConfirm={() => handleDeleteSymbol(record._id)}
            >
              <Button danger type="link">
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ),
    },
  ];

  return (
    <Modal
      title="Invalid Symbols"
      open={open}
      onCancel={onClose}
      footer={null}
      width="70%"
    >
      <Table
        dataSource={data}
        columns={invalidColumns}
        rowKey="_id"
        loading={loading}
        bordered
      />
    </Modal>
  );
}
