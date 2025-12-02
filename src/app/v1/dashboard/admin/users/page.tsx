"use client";

import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Tag, message, Tooltip, Select, Modal, Spin } from "antd";
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
    const [telegramFilterStatus, setTelegramFilterStatus] = useState("");

    // Modal states
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);

    const fetchUsers = async (page = 1, limit = 10, search = "", status = "", telegramStatus = "") => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search,
                status,
                telegramStatus,
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
        fetchUsers(pagination.current, pagination.pageSize, searchText, filterStatus, telegramFilterStatus);
    }, []);

    const handleTableChange = (newPagination: any) => {
        fetchUsers(newPagination.current, newPagination.pageSize, searchText, filterStatus, telegramFilterStatus);
    };

    const [telegramModalVisible, setTelegramModalVisible] = useState(false);
    const [telegramActionLoading, setTelegramActionLoading] = useState(false);
    const [telegramResult, setTelegramResult] = useState<any>(null);

    const handleTelegramAction = (user: any) => {
        setSelectedUser(user);
        setTelegramResult(null);
        setTelegramModalVisible(true);
        // Optionally check status immediately
        checkTelegramStatus(user._id);
    };

    const checkTelegramStatus = async (userId: string) => {
        setTelegramActionLoading(true);
        try {
            const res = await fetch('/api/v1/admin/telegram/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action: 'check' })
            });
            const data = await res.json();
            if (data.success) {
                setTelegramResult((prev: any) => ({ ...prev, status: data.status, telegramUser: data.telegramUser }));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setTelegramActionLoading(false);
        }
    };

    const performTelegramAction = async (action: 'add' | 'remove' | 'resolve' | 'update_status', status?: string) => {
        setTelegramActionLoading(true);
        try {
            const res = await fetch('/api/v1/admin/telegram/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: selectedUser._id, action, status })
            });
            const data = await res.json();
            if (data.success) {
                message.success(data.message);
                setTelegramResult((prev: any) => ({ ...prev, ...data }));
            } else {
                message.error(data.error);
            }
        } catch (error) {
            message.error("Action failed");
        } finally {
            setTelegramActionLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
        fetchUsers(1, pagination.pageSize, value, filterStatus, telegramFilterStatus);
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
            title: "Billing Cycle",
            key: "billingCycle",
            render: (_: any, record: any) => {
                const cycle = record.subscription?.billingCycle;
                if (!cycle) return "-";
                return <Tag color="purple">{cycle.toUpperCase()}</Tag>;
            }
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
                    <Tooltip title="Telegram Actions">
                        <Button
                            onClick={() => handleTelegramAction(record)}
                        >
                            TG
                        </Button>
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
                        fetchUsers(1, pagination.pageSize, searchText, value, telegramFilterStatus);
                    }}
                >
                    <Option value="active">Active</Option>
                    <Option value="expired">Expired</Option>
                </Select>
                <Select
                    placeholder="Telegram Status"
                    style={{ width: 150 }}
                    allowClear
                    onChange={(value) => {
                        setTelegramFilterStatus(value);
                        setPagination({ ...pagination, current: 1 });
                        fetchUsers(1, pagination.pageSize, searchText, filterStatus, value);
                    }}
                >
                    <Option value="granted">Granted</Option>
                    <Option value="revoked">Revoked</Option>
                    <Option value="pending">Pending</Option>
                    <Option value="failed">Failed</Option>
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

            <Modal
                title={`Telegram Management - ${selectedUser?.name}`}
                open={telegramModalVisible}
                onCancel={() => setTelegramModalVisible(false)}
                footer={null}
            >
                <div className="flex flex-col gap-4">
                    <div>
                        <strong>Current Status: </strong>
                        {telegramActionLoading && !telegramResult ? <Spin size="small" /> : (
                            <Tag color={telegramResult?.status === 'member' || telegramResult?.status === 'administrator' || telegramResult?.status === 'creator' ? 'green' : 'red'}>
                                {telegramResult?.status?.toUpperCase() || 'UNKNOWN'}
                            </Tag>
                        )}
                    </div>

                    {telegramResult?.inviteLink && (
                        <div className="p-2 bg-gray-100 rounded border">
                            <p className="text-xs text-gray-500 mb-1">Invite Link (One-time use):</p>
                            <div className="flex items-center gap-2">
                                <Input value={telegramResult.inviteLink} readOnly />
                                <Button onClick={() => {
                                    navigator.clipboard.writeText(telegramResult.inviteLink);
                                    message.success("Copied!");
                                }}>Copy</Button>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 justify-end mt-4">
                        <Button
                            loading={telegramActionLoading}
                            onClick={() => performTelegramAction('resolve')}
                        >
                            Resolve ID
                        </Button>
                        <Button
                            loading={telegramActionLoading}
                            onClick={() => performTelegramAction('add')}
                            type="primary"
                        >
                            Generate Invite
                        </Button>
                        <Button
                            loading={telegramActionLoading}
                            danger
                            onClick={() => performTelegramAction('remove')}
                        >
                            Kick User
                        </Button>
                    </div>

                    <div className="border-t pt-4 mt-2">
                        <p className="text-xs text-gray-500 mb-2">Manual Override (Use with caution):</p>
                        <div className="flex gap-2 justify-end">
                            <Button
                                size="small"
                                onClick={() => performTelegramAction('update_status', 'granted')}
                            >
                                Mark Granted
                            </Button>
                            <Button
                                size="small"
                                danger
                                onClick={() => performTelegramAction('update_status', 'revoked')}
                            >
                                Mark Revoked
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
