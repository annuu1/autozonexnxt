"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Input,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Select,
  DatePicker,
} from "antd";
import {
  SearchOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UserAddOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Subscription {
  _id: string;
  plan: string;
  billingCycle: string;
  amount: number;
  startDate: string;
  expiryDate: string;
  isAutoRenew: boolean;
  userDetails: {
    name: string;
    email: string;
    telegramUsername?: string;
  };
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ field: string; order: string }>({
    field: "createdAt",
    order: "descend",
  });

  const [filters, setFilters] = useState({
    plan: "",
    billingCycle: "",
  });

  // Default date range: last 30 days
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, "day"),
    dayjs(),
  ]);

  const [stats, setStats] = useState({
    totalSubs: 0,
    expiringSoon: 0,
    newThisMonth: 0,
    totalRevenue: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const start = dateRange[0].toISOString();
      const end = dateRange[1].toISOString();
      const res = await fetch(
        `/api/v1/users/subscription?page=${page}&limit=10&search=${search}&sortField=${sort.field}&sortOrder=${sort.order}&plan=${filters.plan}&billingCycle=${filters.billingCycle}&startDate=${start}&endDate=${end}`
      );
      const data = await res.json();
      setSubscriptions(data.data);
      setTotal(data.total);
      setLoading(false);

      const now = new Date();
      const expiringSoon = data.data.filter(
        (sub: Subscription) =>
          new Date(sub.expiryDate).getTime() - now.getTime() <
          7 * 24 * 60 * 60 * 1000
      ).length;

      const newThisMonth = data.data.filter(
        (sub: Subscription) =>
          new Date(sub.startDate).getMonth() === now.getMonth()
      ).length;

      const totalRevenue = data.data.reduce(
        (sum: number, sub: Subscription) => sum + sub.amount,
        0
      );

      setStats({
        totalSubs: data.total,
        expiringSoon,
        newThisMonth,
        totalRevenue,
      });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search, sort, filters, dateRange]);

  const columns = [
    {
      title: "User",
      dataIndex: ["userDetails", "name"],
      key: "user",
      render: (text: string, record: Subscription) => (
        <div>
          <b>{text}</b>
          <br />
          <span style={{ fontSize: 12, color: "#888" }}>
            {record.userDetails.email}
          </span>
        </div>
      ),
    },
    {
      title: "Plan",
      dataIndex: "plan",
      key: "plan",
      render: (plan: string) => <Tag color="blue">{plan.toUpperCase()}</Tag>,
    },
    {
      title: "Billing",
      dataIndex: "billingCycle",
      key: "billingCycle",
      render: (cycle: string) => <Tag color="purple">{cycle}</Tag>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      sorter: true,
      render: (amt: number) => `₹${amt}`,
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (date: string) => {
        const d = new Date(date);
        const expired = d < new Date();
        return (
          <Tag color={expired ? "red" : "green"}>{d.toLocaleDateString()}</Tag>
        );
      },
    },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* ---------- Analytics Cards ---------- */}
      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Subscriptions"
              value={stats.totalSubs}
              prefix={<UserAddOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Expiring Soon (7d)"
              value={stats.expiringSoon}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="New This Month"
              value={stats.newThisMonth}
              prefix={<UserAddOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              prefix={<DollarOutlined />}
              value={stats.totalRevenue}
            />
          </Card>
        </Col>
      </Row>

      {/* ---------- Filters ---------- */}
      <Space wrap style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search plan, billing cycle..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ width: 200 }}
        />

        <Select
          placeholder="Plan"
          allowClear
          value={filters.plan}
          onChange={(v) => setFilters((f) => ({ ...f, plan: v || "" }))}
          style={{ width: 140 }}
          suffixIcon={<FilterOutlined />}
        >
          <Option value="starter">Starter</Option>
          <Option value="pro">Pro</Option>
          <Option value="elite">Elite</Option>
        </Select>

        <Select
          placeholder="Billing Cycle"
          allowClear
          value={filters.billingCycle}
          onChange={(v) => setFilters((f) => ({ ...f, billingCycle: v || "" }))}
          style={{ width: 160 }}
          suffixIcon={<FilterOutlined />}
        >
          <Option value="monthly">Monthly</Option>
          <Option value="quaterly">Quaterly</Option>
          <Option value="yearly">Yearly</Option>
        </Select>

        <RangePicker
          value={dateRange}
          onChange={(range) => {
            if (range) setDateRange(range as [dayjs.Dayjs, dayjs.Dayjs]);
          }}
          allowClear={false}
        />
      </Space>

      {/* ---------- Table ---------- */}
      <Table
        columns={columns}
        dataSource={subscriptions}
        loading={loading}
        rowKey="_id"
        pagination={{
          current: page,
          total,
          onChange: (p) => setPage(p),
        }}
        onChange={(pagination, filters, sorter: any) =>
          setSort({
            field: sorter.field || "createdAt",
            order: sorter.order || "descend",
          })
        }
      />
    </div>
  );
}
