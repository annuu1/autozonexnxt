"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Space,
  Button,
  DatePicker,
  Select,
  Input,
  Row,
  Col,
  message,
  Tabs,
  Statistic,
  Grid,
  List,
  Divider,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import TradeFormModal from "@/components/trades/TradeFormModal";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { useBreakpoint } = Grid;

export default function TradesPage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const screens = useBreakpoint();

  // Filters
  const [filters, setFilters] = useState({
    symbol: "",
    status: "",
    range: [] as any[],
  });

  // Analytics Summary (Quick View)
  const [stats, setStats] = useState<any>(null);

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", rowsPerPage.toString());
      if (filters.symbol) params.append("symbol", filters.symbol);
      if (filters.status) params.append("status", filters.status);
      if (filters.range && filters.range.length === 2) {
        params.append("startDate", filters.range[0].toISOString());
        params.append("endDate", filters.range[1].toISOString());
      }

      const res = await fetch(`/api/v1/trades?${params.toString()}`);
      const data = await res.json();
      setTrades(data.data);
      setTotal(data.pagination.total);
    } catch (err) {
      console.error(err);
      message.error("Failed to load trades");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/v1/trades/analytics`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchAnalytics();
  }, [trades]); // Refresh analytics when trades change

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/trades?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      message.success("Trade deleted");
      fetchTrades();
    } catch (err) {
      message.error("Error deleting trade");
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: "Date",
      dataIndex: "date",
      render: (val: string) => dayjs(val).format("DD MMM YYYY HH:mm"),
    },
    {
      title: "Symbol",
      dataIndex: "symbol",
      render: (val: string) => <b>{val}</b>,
    },
    {
      title: "Pos",
      dataIndex: "position_type",
      render: (val: string) => (
        <Tag color={val === "Long" ? "green" : "red"}>{val?.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Type",
      dataIndex: "trade_type",
      render: (val: string) => <Tag>{val}</Tag>,
    },
    {
      title: "Setup",
      dataIndex: ["pre_trade", "setup_name"],
      render: (val: string) => val || "-",
    },
    {
      title: "PnL",
      dataIndex: ["pnl", "net"],
      render: (val: number, rec) => {
        if (rec.status !== "Closed" && rec.status !== "SL Hit" && rec.status !== "Target Hit") return <Tag>Open</Tag>;
        const color = val > 0 ? "green" : val < 0 ? "red" : "default";
        return <Text style={{ color: val > 0 ? '#3f8600' : '#cf1322', fontWeight: 'bold' }}>{val ? val.toFixed(2) : 0}</Text>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (val: string, rec: any) => {
        let color = "default";
        if (val === "Open") color = "blue";
        if (val === "Target Hit") color = "green";
        if (val === "SL Hit") color = "red";

        return (
          <Space direction="vertical" size={0}>
            <Tag color={color}>{val}</Tag>
            {rec.suggested_status && (
              <Tag color="orange" style={{ fontSize: 10, marginTop: 4 }}>
                Suggestion: {rec.suggested_status}
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Rating",
      dataIndex: ["post_trade", "rating"],
      render: (val: number) => val ? `${val} ⭐` : '-',
    },
    {
      title: "Actions",
      render: (_: any, row: any) => (
        <Space>
          {/* Edit using same modal logic, would need to pass initial values. For now simpler edit button */}
          <TradeFormModal
            trigger={<Button type="text" icon={<EditOutlined />} />}
            initialValues={{
              ...row,
              date: dayjs(row.date),
              exit_date: row.exit_date ? dayjs(row.exit_date) : null
            }}
            onSuccess={fetchTrades}
          />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(row._id)} />
        </Space>
      ),
    },
  ];

  const AnalyticsView = () => (
    <div style={{ marginTop: 20 }}>
      {stats ? (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Win Rate" value={stats.summary.winRate} suffix="%" prefix={<RiseOutlined />} valueStyle={{ color: '#3f8600' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Total PnL" value={stats.summary.totalPnL} precision={2} valueStyle={{ color: stats.summary.totalPnL >= 0 ? '#3f8600' : '#cf1322' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Profit Factor" value={stats.summary.profitFactor} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Total Trades" value={stats.summary.totalTrades} />
            </Card>
          </Col>
        </Row>
      ) : <p>Loading Analytics...</p>}
      {/* Further charts can be added here */}
    </div>
  );

  return (
    <Card bodyStyle={{ padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, alignItems: "center" }}>
        <Title level={4} style={{ margin: 0 }}>📒 Journal</Title>
        <TradeFormModal onSuccess={fetchTrades} />
      </div>

      <Tabs defaultActiveKey="journal">
        <Tabs.TabPane tab="Entries" key="journal">
          {/* Filters */}
          <Card size="small" style={{ marginBottom: 16, background: "#f9f9f9" }} bodyStyle={{ padding: 12 }}>
            <Row gutter={[8, 8]} align="middle">
              <Col xs={24} sm={12} md={6}>
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Search Symbol"
                  value={filters.symbol}
                  onChange={(e) => setFilters({ ...filters, symbol: e.target.value })}
                  style={{ width: "100%" }}
                />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Status"
                  allowClear
                  onChange={(val) => setFilters({ ...filters, status: val })}
                >
                  <Option value="Open">Open</Option>
                  <Option value="Closed">Closed</Option>
                  <Option value="SL Hit">SL Hit</Option>
                  <Option value="Target Hit">Target Hit</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <RangePicker
                  style={{ width: "100%" }}
                  onChange={(dates) => setFilters({ ...filters, range: dates as any })}
                />
              </Col>
              <Col xs={24} sm={12} md={6} style={{ textAlign: screens.md ? "right" : "left" }}>
                <Button block={!screens.md} onClick={() => { setFilters({ symbol: "", status: "", range: [] }); setPage(1); }}>
                  Reset
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Table for Desktop, List for Mobile */}
          {screens.md ? (
            <Table
              rowKey="_id"
              columns={columns}
              dataSource={trades}
              loading={loading}
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
              scroll={{ x: 1000 }}
            />
          ) : (
            <List
              dataSource={trades}
              loading={loading}
              pagination={{
                current: page,
                pageSize: rowsPerPage,
                total,
                onChange: (p) => setPage(p),
                align: 'center',
                size: 'small'
              }}
              renderItem={(item) => {
                const pnl = item.pnl?.net || 0;
                const pnlColor = pnl > 0 ? '#3f8600' : pnl < 0 ? '#cf1322' : 'inherit';

                return (
                  <Card style={{ marginBottom: 12 }} size="small">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <Text strong>{item.symbol}</Text>
                        <span style={{ marginLeft: 8 }}><Tag color={item.position_type === 'Long' ? 'green' : 'red'}>{item.position_type}</Tag></span>
                      </div>
                      <Tag color={item.status === 'Open' ? 'blue' : item.status === 'SL Hit' ? 'red' : item.status === 'Target Hit' ? 'green' : 'default'}>{item.status}</Tag>
                    </div>

                    <Row gutter={8}>
                      <Col span={12}>
                        <span style={{ color: '#888', fontSize: 12 }}>Date:</span> {dayjs(item.date).format("DD MMM HH:mm")}
                      </Col>
                      <Col span={12} style={{ textAlign: 'right' }}>
                        <span style={{ color: '#888', fontSize: 12 }}>PnL:</span>
                        <Text strong style={{ color: pnlColor, marginLeft: 4 }}>{pnl.toFixed(2)}</Text>
                      </Col>

                      {item.suggested_status && (
                        <Col span={24} style={{ marginTop: 8 }}>
                          <Tag color="orange" style={{ width: '100%', textAlign: 'center' }}>Suggestion: {item.suggested_status}</Tag>
                        </Col>
                      )}
                      <Col span={24} style={{ marginTop: 8 }}>
                        <Space>
                          <TradeFormModal
                            trigger={<Button size="small" icon={<EditOutlined />}>Edit</Button>}
                            initialValues={{ ...item, date: dayjs(item.date), exit_date: item.exit_date ? dayjs(item.exit_date) : null }}
                            onSuccess={fetchTrades}
                          />
                          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(item._id)}>Delete</Button>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                );
              }}
            />
          )}
        </Tabs.TabPane>

        <Tabs.TabPane tab="Analytics" key="analytics">
          <AnalyticsView />
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
}
