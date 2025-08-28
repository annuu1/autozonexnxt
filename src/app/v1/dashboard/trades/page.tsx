"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Space,
  Button,
  Divider,
  List,
  Grid,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import TradeFormModal from "@/components/trades/TradeFormModal";

const { Title } = Typography;
const { useBreakpoint } = Grid;

export default function TradesPage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const screens = useBreakpoint();

  // 🔹 Fetch trades
  useEffect(() => {
    fetch(`/api/v1/trades?page=${page}&limit=${rowsPerPage}`)
      .then((res) => res.json())
      .then((res) => {
        setTrades(res.data);
        setTotal(res.total);
      });
  }, [page, rowsPerPage]);

  const formatNumber = (val: any) =>
    typeof val === "number" ? val.toFixed(2) : val;

  const getTradeTypeTag = (type: string) => {
    if (type === "BUY") return <Tag color="green">BUY</Tag>;
    if (type === "SELL") return <Tag color="red">SELL</Tag>;
    return <Tag>{type}</Tag>;
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case "OPEN":
        return <Tag color="blue">OPEN</Tag>;
      case "CLOSED":
        return <Tag color="default">CLOSED</Tag>;
      case "STOPPED":
        return <Tag color="red">STOPPED</Tag>;
      case "TARGET_HIT":
        return <Tag color="green">TARGET HIT</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/trades`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id }),
      });
  
      if (!res.ok) throw new Error("Failed to delete");
  
      // 🔹 Remove from local state
      setTrades((prev) => prev.filter((trade) => trade._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/trades`, {
        headers: { "Content-Type": "application/json" },
        method: "PUT",
        body: JSON.stringify({ _id: id }),
      });
  
      if (!res.ok) throw new Error("Failed to edit"); 
  
      // 🔹 Remove from local state
      console.log(res)
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Ant Design Table Columns
  const columns: ColumnsType<any> = [
    {
      title: "Symbol",
      dataIndex: "symbol",
      render: (val: string) => <b>{val}</b>,
    },
    {
      title: "Trade Type",
      dataIndex: "trade_type",
      render: (val: string) => getTradeTypeTag(val),
    },
    {
      title: "Entry",
      dataIndex: "entry_price",
      render: (val: number) => formatNumber(val),
    },
    {
      title: "Stop Loss",
      dataIndex: "stop_loss",
      render: (val: number) => formatNumber(val),
    },
    {
      title: "Target",
      dataIndex: "target_price",
      render: (val: number) => formatNumber(val),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (val: string) => getStatusTag(val),
    },
    {
      title: "Created",
      dataIndex: "created_at",
      render: (val: string) =>
        new Date(val).toLocaleDateString() +
        " " +
        new Date(val).toLocaleTimeString(),
    },
    {
      title: "Actions",
      render: (_: any, row: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(row._id)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(row._id)} />
        </Space>
      ),
    },
  ];

  return (
    <Card style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
    <Title level={3}>📊 Trades</Title>
    <TradeFormModal onSuccess={() => {
      // refresh table after adding
      setPage(1);
    }} />
  </Space>

      {/* 🔹 Desktop = Table | Mobile = Card List */}
      {screens.md ? (
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={trades}
          pagination={{
            current: page,
            pageSize: rowsPerPage,
            total,
            showSizeChanger: true,
            onChange: (p, pageSize) => {
              setPage(p);
              setRowsPerPage(pageSize);
            },
          }}
          bordered
          scroll={{ x: "max-content" }}
        />
      ) : (
        <List
          dataSource={trades}
          pagination={{
            current: page,
            pageSize: rowsPerPage,
            total,
            onChange: (p) => setPage(p),
          }}
          renderItem={(item) => (
            <Card style={{ marginBottom: 12 }}>
              <b>{item.symbol}</b> {getTradeTypeTag(item.trade_type)}{" "}
              {getStatusTag(item.status)}
              <Divider />
              <p>💰 Entry: {formatNumber(item.entry_price)}</p>
              <p>🛑 Stop Loss: {formatNumber(item.stop_loss)}</p>
              <p>🎯 Target: {formatNumber(item.target_price)}</p>
              <p>📅 Created: {new Date(item.created_at).toLocaleString()}</p>
              {item.note && <p>📝 Note: {item.note}</p>}
            </Card>
          )}
        />
      )}
    </Card>
  );
}
