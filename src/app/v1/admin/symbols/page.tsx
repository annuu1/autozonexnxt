'use client';

import { useState, useEffect } from 'react';
import { Table, Switch, Input, Button, Modal, Form, Select, message, Tag } from 'antd';
import { EditOutlined, SearchOutlined } from '@ant-design/icons';

interface SymbolData {
    _id: string;
    symbol: string;
    company_name: string;
    sectors: string[];
    status: string;
    is_liquid: boolean;
    watchlists: string[];
}

export default function SymbolsPage() {
    const [symbols, setSymbols] = useState<SymbolData[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [isLiquidFilter, setIsLiquidFilter] = useState<boolean | undefined>(undefined);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSymbol, setEditingSymbol] = useState<SymbolData | null>(null);
    const [form] = Form.useForm();

    const fetchSymbols = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pageSize.toString(),
                search,
            });
            if (isLiquidFilter !== undefined) {
                params.append('is_liquid', isLiquidFilter.toString());
            }

            const res = await fetch(`/api/v1/admin/symbols?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setSymbols(data.symbols);
                setTotal(data.pagination.total);
            } else {
                message.error(data.error || 'Failed to fetch symbols');
            }
        } catch (error) {
            message.error('Error fetching symbols');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSymbols();
    }, [page, pageSize, search, isLiquidFilter]);

    const handleUpdate = async (id: string, updates: Partial<SymbolData>) => {
        try {
            const res = await fetch('/api/v1/admin/symbols', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: id, ...updates }),
            });
            const data = await res.json();
            if (data.success) {
                message.success('Symbol updated successfully');
                fetchSymbols();
                return true;
            } else {
                message.error(data.error || 'Failed to update symbol');
                return false;
            }
        } catch (error) {
            message.error('Error updating symbol');
            return false;
        }
    };

    const openEditModal = (record: SymbolData) => {
        setEditingSymbol(record);
        form.setFieldsValue({
            company_name: record.company_name,
            status: record.status,
            sectors: record.sectors,
            watchlists: record.watchlists,
            is_liquid: record.is_liquid,
        });
        setIsModalOpen(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingSymbol) {
                const success = await handleUpdate(editingSymbol._id, values);
                if (success) {
                    setIsModalOpen(false);
                    setEditingSymbol(null);
                }
            }
        } catch (error) {
            console.error('Validate Failed:', error);
        }
    };

    const columns = [
        {
            title: 'Symbol',
            dataIndex: 'symbol',
            key: 'symbol',
            render: (text: string) => <b>{text}</b>,
        },
        {
            title: 'Company Name',
            dataIndex: 'company_name',
            key: 'company_name',
        },
        {
            title: 'Sectors',
            dataIndex: 'sectors',
            key: 'sectors',
            render: (sectors: string[]) => (
                <>
                    {sectors?.map((sector) => (
                        <Tag key={sector}>{sector}</Tag>
                    ))}
                </>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
            ),
        },
        {
            title: 'Is Liquid',
            dataIndex: 'is_liquid',
            key: 'is_liquid',
            render: (isLiquid: boolean, record: SymbolData) => (
                <Switch
                    checked={isLiquid}
                    onChange={(checked) => handleUpdate(record._id, { is_liquid: checked })}
                />
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: SymbolData) => (
                <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Symbol Management</h1>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Select
                        placeholder="Filter by Liquidity"
                        allowClear
                        style={{ width: 150 }}
                        onChange={(value) => setIsLiquidFilter(value === 'true' ? true : value === 'false' ? false : undefined)}
                        options={[
                            { value: 'true', label: 'Liquid' },
                            { value: 'false', label: 'Not Liquid' },
                        ]}
                    />
                    <Input
                        placeholder="Search symbols..."
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: 200 }}
                    />
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={symbols}
                rowKey="_id"
                loading={loading}
                pagination={{
                    current: page,
                    pageSize: pageSize,
                    total: total,
                    onChange: (p, ps) => {
                        setPage(p);
                        setPageSize(ps);
                    },
                }}
            />

            <Modal
                title={`Edit Symbol: ${editingSymbol?.symbol}`}
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={() => setIsModalOpen(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="company_name" label="Company Name">
                        <Input />
                    </Form.Item>
                    <Form.Item name="status" label="Status">
                        <Select>
                            <Select.Option value="Active">Active</Select.Option>
                            <Select.Option value="Inactive">Inactive</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="sectors" label="Sectors">
                        <Select mode="tags" placeholder="Add sectors" />
                    </Form.Item>
                    <Form.Item name="watchlists" label="Watchlists">
                        <Select mode="tags" placeholder="Add watchlists" />
                    </Form.Item>
                    <Form.Item name="is_liquid" label="Is Liquid" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
