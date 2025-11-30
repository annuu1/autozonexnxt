"use client";

import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Tag, message, Tooltip, Select } from "antd";
import {
    SearchOutlined,
    EyeOutlined,
    PlusCircleOutlined,
} from "@ant-design/icons";
import UserDetailsModal from "@/components/users/UserDetailsModal";
import SubscriptionModal from "@/components/users/SubscriptionModal";
import Link from "next/link";
import dayjs from "dayjs";

const { Option } = Select;

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    // Modal states
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);

    const fetchUsers = async (page = 1, limit = 10, search = "", status = "") => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search,
                status,
            });
            const res = await fetch(`/api/v1/admin/users?${query}`);
            const data = await res.json();

            if (data.success) {
                setUsers(data.users);
                setPagination({
                    current: data.pagination.page,
                    pageSize: data.pagination.limit,
                    total: data.pagination.total,
                });
            } else {
                message.error(data.error || "Failed to fetch users");
            }
        } catch (error) {
            message.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(pagination.current, pagination.pageSize, searchText, filterStatus);
    }, []);

    const handleTableChange = (newPagination: any) => {
        fetchUsers(newPagination.current, newPagination.pageSize, searchText, filterStatus);
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
        fetchUsers(1, pagination.pageSize, value, filterStatus);
    };

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Roles",
            dataIndex: "roles",
            key: "roles",
            render: (roles: string[]) => (
                <>
                    {roles?.map((role) => (
                        <Tag color={role === "admin" ? "red" : "blue"} key={role}>
                            {role?.toUpperCase()}
                        </Tag>
                    ))}
                </>
            ),
        },
        {
            title: "Subscription",
            key: "subscription",
            render: (_: any, record: any) => {
                const sub = record.subscription;
                if (!sub || sub.status !== "active") {
                    // Check if it was previously active but now expired
                    if (sub?.status === "expired") {
                        return <Tag color="red">EXPIRED</Tag>;
                    }
                    return <Tag color="default">Inactive</Tag>;
                }

                // Double check expiration on frontend just in case
                const isExpired = sub.endDate && dayjs(sub.endDate).isBefore(dayjs());
                if (isExpired) {
                    return <Tag color="red">EXPIRED</Tag>;
                }

                return (
                    <Tag color="green">
                        {sub.plan?.toUpperCase() || "ACTIVE"}
                    </Tag>
                );
            },
        },
        {
            title: "Expiry Date",
            key: "expiry",
            render: (_: any, record: any) => {
                // The API now calculates and populates endDate based on billing cycle
                const date = record.subscription?.endDate;
                if (!date) return "-";
                return dayjs(date).format("DD MMM YYYY");
            }
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Tooltip title="View Details">
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => {
                                setSelectedUser(record);
                                setDetailsModalVisible(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Add Subscription">
                        <Button
                            icon={<PlusCircleOutlined />}
                            onClick={() => {
                                setSelectedUser(record);
                                setSubscriptionModalVisible(true);
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User Management</h1>
                <Link href="/v1/dashboard/admin">
                    <Button>Back to Dashboard</Button>
                </Link>
            </div>

            <div className="mb-4 flex gap-4">
                <Input.Search
                    placeholder="Search by name or email"
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                    allowClear
                />
                <Select
                    placeholder="Filter by Status"
                    style={{ width: 150 }}
                    allowClear
                    onChange={(value) => {
                        setFilterStatus(value);
                        setPagination({ ...pagination, current: 1 });
                        fetchUsers(1, pagination.pageSize, searchText, value);
                    }}
                >
                    <Option value="active">Active</Option>
                    <Option value="expired">Expired</Option>
                </Select>
            </div>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="_id"
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
            />

            <UserDetailsModal
                visible={detailsModalVisible}
                user={selectedUser}
                onClose={() => setDetailsModalVisible(false)}
            />

            {selectedUser && (
                <SubscriptionModal
                    open={subscriptionModalVisible}
                    user={selectedUser}
                    onClose={() => setSubscriptionModalVisible(false)}
                    onSuccess={() => {
                        setSubscriptionModalVisible(false);
                        fetchUsers(pagination.current, pagination.pageSize, searchText, filterStatus);
                    }}
                />
            )}
        </div>
    );
}
