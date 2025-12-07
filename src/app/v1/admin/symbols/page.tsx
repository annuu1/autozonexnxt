'use client';

import { useState, useEffect } from 'react';
import { Table, Switch, Input, Button, Modal, Form, Select, message, Tag, Space, Upload, Dropdown, MenuProps, Popconfirm, Drawer } from 'antd';
import {
    EditOutlined,
    SearchOutlined,
    PlusOutlined,
    UploadOutlined,
    DeleteOutlined,
    MoreOutlined,
    ExclamationCircleOutlined,
    EyeOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import dayjs from 'dayjs';

interface SymbolData {
    _id: string;
    symbol: string;
    company_name: string;
    sectors: string[];
    status: string;
    is_liquid: boolean;
    watchlists: string[];
}

interface DemandZone {
    _id: string;
    zone_id: string;
    ticker: string;
    timeframes: string[];
    proximal_line: number;
    distal_line: number;
    freshness: number;
    trade_score: number;
    timestamp: string;
}

export default function SymbolsPage() {
    const [symbols, setSymbols] = useState<SymbolData[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [isLiquidFilter, setIsLiquidFilter] = useState<boolean | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const [sectorFilter, setSectorFilter] = useState<string | undefined>(undefined);
    const [watchlistFilter, setWatchlistFilter] = useState<string | undefined>(undefined);

    // Filter Options
    const [sectorOptions, setSectorOptions] = useState<string[]>([]);
    const [watchlistOptions, setWatchlistOptions] = useState<string[]>([]);

    // Selection
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    // Modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [editingSymbol, setEditingSymbol] = useState<SymbolData | null>(null);

    // Bulk Action Modals
    const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false);
    const [bulkActionType, setBulkActionType] = useState<'add_sector' | 'add_watchlist' | null>(null);
    const [bulkActionValue, setBulkActionValue] = useState('');

    // Demand Zones Drawer
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [currentTicker, setCurrentTicker] = useState<string | null>(null);
    const [demandZones, setDemandZones] = useState<DemandZone[]>([]);
    const [zonesLoading, setZonesLoading] = useState(false);

    // Upload Form
    const [targetSector, setTargetSector] = useState('');
    const [targetWatchlist, setTargetWatchlist] = useState('');

    const [form] = Form.useForm();
    const [addForm] = Form.useForm();

    const fetchFilters = async () => {
        try {
            const res = await fetch('/api/v1/admin/symbols/filters');
            const data = await res.json();
            if (data.success) {
                setSectorOptions(data.sectors);
                setWatchlistOptions(data.watchlists);
            }
        } catch (error) {
            console.error('Failed to fetch filters', error);
        }
    };

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
            if (statusFilter) {
                params.append('status', statusFilter);
            }
            if (sectorFilter) {
                params.append('sector', sectorFilter);
            }
            if (watchlistFilter) {
                params.append('watchlist', watchlistFilter);
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
        fetchFilters();
    }, []);

    useEffect(() => {
        fetchSymbols();
    }, [page, pageSize, search, isLiquidFilter, statusFilter, sectorFilter, watchlistFilter]);

    // --- Demand Zones ---
    const fetchDemandZones = async (ticker: string) => {
        setZonesLoading(true);
        setCurrentTicker(ticker);
        setIsDrawerOpen(true);
        try {
            const res = await fetch(`/api/v1/admin/demand-zones?ticker=${ticker}`);
            const data = await res.json();
            if (data.success) {
                setDemandZones(data.zones);
            } else {
                message.error('Failed to fetch demand zones');
            }
        } catch (error) {
            message.error('Error fetching demand zones');
        } finally {
            setZonesLoading(false);
        }
    };

    // --- CRUD Operations ---

    const handleCreate = async (values: any) => {
        try {
            const res = await fetch('/api/v1/admin/symbols', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            const data = await res.json();
            if (data.success) {
                message.success('Symbol created');
                setIsAddModalOpen(false);
                addForm.resetFields();
                fetchSymbols();
                fetchFilters(); // Refresh filters in case new sectors/watchlists were added
            } else {
                message.error(data.error);
            }
        } catch (error) {
            message.error('Failed to create symbol');
        }
    };

    const handleUpdate = async (id: string, updates: Partial<SymbolData>) => {
        try {
            const res = await fetch('/api/v1/admin/symbols', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: id, ...updates }),
            });
            const data = await res.json();
            if (data.success) {
                message.success('Symbol updated');
                fetchSymbols();
                fetchFilters();
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

    const handleDelete = async (ids: string[]) => {
        try {
            const res = await fetch(`/api/v1/admin/symbols?ids=${ids.join(',')}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                message.success(data.message);
                setSelectedRowKeys([]);
                fetchSymbols();
                fetchFilters();
            } else {
                message.error(data.error);
            }
        } catch (error) {
            message.error('Failed to delete symbols');
        }
    };

    // --- Bulk Operations ---

    const handleBulkUpdate = async (action: string, value: any) => {
        if (selectedRowKeys.length === 0) return;
        try {
            const res = await fetch('/api/v1/admin/symbols', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ids: selectedRowKeys,
                    action,
                    value
                }),
            });
            const data = await res.json();
            if (data.success) {
                message.success('Bulk update successful');
                setSelectedRowKeys([]);
                setIsBulkActionModalOpen(false);
                setBulkActionValue('');
                fetchSymbols();
                fetchFilters();
            } else {
                message.error(data.error);
            }
        } catch (error) {
            message.error('Failed to perform bulk update');
        }
    };

    // --- Upload ---
    const uploadProps: UploadProps = {
        name: 'file',
        action: '/api/v1/admin/symbols/upload',
        showUploadList: false,
        data: {
            targetSector,
            targetWatchlist
        },
        onChange(info) {
            if (info.file.status === 'done') {
                if (info.file.response.success) {
                    message.success(`${info.file.name} uploaded successfully. ${info.file.response.message}`);
                    setIsUploadModalOpen(false);
                    setTargetSector('');
                    setTargetWatchlist('');
                    fetchSymbols();
                    fetchFilters();
                } else {
                    message.error(`${info.file.name} upload failed: ${info.file.response.error}`);
                }
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} upload failed.`);
            }
        },
    };

    // --- UI Helpers ---

    const openEditModal = (record: SymbolData) => {
        setEditingSymbol(record);
        form.setFieldsValue({
            company_name: record.company_name,
            status: record.status,
            sectors: record.sectors,
            watchlists: record.watchlists,
            is_liquid: record.is_liquid,
        });
        setIsEditModalOpen(true);
    };

    const handleEditOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingSymbol) {
                const success = await handleUpdate(editingSymbol._id, values);
                if (success) {
                    setIsEditModalOpen(false);
                    setEditingSymbol(null);
                }
            }
        } catch (error) {
            console.error('Validate Failed:', error);
        }
    };

    const bulkMenuProps: MenuProps = {
        items: [
            {
                key: 'active',
                label: 'Set Status: Active',
                onClick: () => handleBulkUpdate('update_status', 'active'),
            },
            {
                key: 'inactive',
                label: 'Set Status: Inactive',
                onClick: () => handleBulkUpdate('update_status', 'inactive'),
            },
            {
                key: 'liquid',
                label: 'Set Liquid: True',
                onClick: () => handleBulkUpdate('update_liquidity', true),
            },
            {
                key: 'not_liquid',
                label: 'Set Liquid: False',
                onClick: () => handleBulkUpdate('update_liquidity', false),
            },
            {
                type: 'divider',
            },
            {
                key: 'add_sector',
                label: 'Add Sector...',
                onClick: () => {
                    setBulkActionType('add_sector');
                    setIsBulkActionModalOpen(true);
                },
            },
            {
                key: 'add_watchlist',
                label: 'Add Watchlist...',
                onClick: () => {
                    setBulkActionType('add_watchlist');
                    setIsBulkActionModalOpen(true);
                },
            },
        ],
    };

    const columns = [
        {
            title: 'Symbol',
            dataIndex: 'symbol',
            key: 'symbol',
            fixed: 'left' as const,
            render: (text: string) => <b>{text}</b>,
        },
        {
            title: 'Company Name',
            dataIndex: 'company_name',
            key: 'company_name',
            responsive: ['md'],
        },
        {
            title: 'Sectors',
            dataIndex: 'sectors',
            key: 'sectors',
            responsive: ['lg'],
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
                <Tag color={status === 'active' ? 'green' : 'red'}>{status}</Tag>
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
            fixed: 'right' as const,
            render: (_: any, record: SymbolData) => (
                <Space>
                    <Button icon={<EyeOutlined />} size="small" onClick={() => fetchDemandZones(record.symbol)} title="View Zones" />
                    <Button icon={<EditOutlined />} size="small" onClick={() => openEditModal(record)} />
                    <Popconfirm title="Delete symbol?" onConfirm={() => handleDelete([record._id])}>
                        <Button icon={<DeleteOutlined />} size="small" danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const zoneColumns = [
        { title: 'Zone ID', dataIndex: 'zone_id', key: 'zone_id' },
        { title: 'Timeframes', dataIndex: 'timeframes', key: 'timeframes', render: (t: string[]) => t.join(', ') },
        { title: 'Proximal', dataIndex: 'proximal_line', key: 'proximal_line' },
        { title: 'Distal', dataIndex: 'distal_line', key: 'distal_line' },
        { title: 'Freshness', dataIndex: 'freshness', key: 'freshness' },
        { title: 'Score', dataIndex: 'trade_score', key: 'trade_score' },
        { title: 'Date', dataIndex: 'timestamp', key: 'timestamp', render: (d: string) => dayjs(d).format('DD MMM YYYY') },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ margin: 0 }}>Symbol Management</h1>
                    <span style={{ color: '#888' }}>Total Symbols: {total}</span>
                </div>
                <Space wrap>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>
                        Add Symbol
                    </Button>
                    <Button icon={<UploadOutlined />} onClick={() => setIsUploadModalOpen(true)}>
                        Upload CSV
                    </Button>
                </Space>
            </div>

            <div style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Select
                    placeholder="Filter by Status"
                    allowClear
                    style={{ width: 150 }}
                    onChange={(value) => setStatusFilter(value)}
                    options={[
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' },
                    ]}
                />
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
                <Select
                    placeholder="Filter by Sector"
                    allowClear
                    showSearch
                    style={{ width: 180 }}
                    onChange={(value) => setSectorFilter(value)}
                    options={sectorOptions.map(s => ({ value: s, label: s }))}
                />
                <Select
                    placeholder="Filter by Watchlist"
                    allowClear
                    showSearch
                    style={{ width: 180 }}
                    onChange={(value) => setWatchlistFilter(value)}
                    options={watchlistOptions.map(w => ({ value: w, label: w }))}
                />
                <Input
                    placeholder="Search symbols..."
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: 200 }}
                />
            </div>

            {selectedRowKeys.length > 0 && (
                <div style={{ marginBottom: 16, padding: 12, background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span>Selected {selectedRowKeys.length} items</span>
                    <Space>
                        <Popconfirm
                            title={`Delete ${selectedRowKeys.length} symbols?`}
                            description="This will also delete associated Demand Zones."
                            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                            onConfirm={() => handleDelete(selectedRowKeys as string[])}
                        >
                            <Button danger icon={<DeleteOutlined />}>Delete Selected</Button>
                        </Popconfirm>

                        <Dropdown menu={bulkMenuProps}>
                            <Button icon={<MoreOutlined />}>Bulk Actions</Button>
                        </Dropdown>
                    </Space>
                </div>
            )}

            <Table
                columns={columns as any}
                dataSource={symbols}
                rowKey="_id"
                loading={loading}
                rowSelection={{
                    selectedRowKeys,
                    onChange: (keys) => setSelectedRowKeys(keys),
                }}
                scroll={{ x: 1000 }}
                pagination={{
                    current: page,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'],
                    onChange: (p, ps) => {
                        setPage(p);
                        setPageSize(ps);
                    },
                }}
            />

            {/* Edit Modal */}
            <Modal
                title={`Edit Symbol: ${editingSymbol?.symbol}`}
                open={isEditModalOpen}
                onOk={handleEditOk}
                onCancel={() => setIsEditModalOpen(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="company_name" label="Company Name">
                        <Input />
                    </Form.Item>
                    <Form.Item name="status" label="Status">
                        <Select>
                            <Select.Option value="active">Active</Select.Option>
                            <Select.Option value="inactive">Inactive</Select.Option>
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

            {/* Add Modal */}
            <Modal
                title="Add New Symbol"
                open={isAddModalOpen}
                onOk={() => addForm.submit()}
                onCancel={() => setIsAddModalOpen(false)}
            >
                <Form form={addForm} layout="vertical" onFinish={handleCreate}>
                    <Form.Item name="symbol" label="Symbol" rules={[{ required: true }]}>
                        <Input placeholder="e.g. RELIANCE" />
                    </Form.Item>
                    <Form.Item name="company_name" label="Company Name">
                        <Input placeholder="e.g. Reliance Industries" />
                    </Form.Item>
                    <Form.Item name="sectors" label="Sectors">
                        <Select mode="tags" placeholder="Add sectors" />
                    </Form.Item>
                    <Form.Item name="is_liquid" label="Is Liquid" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Upload Modal */}
            <Modal
                title="Upload Symbols CSV"
                open={isUploadModalOpen}
                footer={null}
                onCancel={() => setIsUploadModalOpen(false)}
            >
                <div style={{ marginBottom: 16 }}>
                    <p>Optional: Add all uploaded symbols to a specific Sector or Watchlist.</p>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Input
                            placeholder="Target Sector (e.g. Banking)"
                            value={targetSector}
                            onChange={e => setTargetSector(e.target.value)}
                        />
                        <Input
                            placeholder="Target Watchlist (e.g. Nifty 50)"
                            value={targetWatchlist}
                            onChange={e => setTargetWatchlist(e.target.value)}
                        />
                    </Space>
                </div>

                <p>CSV Format: symbol, company_name, sectors, watchlists, is_liquid, status</p>
                <Upload.Dragger {...uploadProps}>
                    <p className="ant-upload-drag-icon">
                        <UploadOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                </Upload.Dragger>
            </Modal>

            {/* Bulk Action Input Modal */}
            <Modal
                title={bulkActionType === 'add_sector' ? 'Add Sector to Selected' : 'Add Watchlist to Selected'}
                open={isBulkActionModalOpen}
                onOk={() => handleBulkUpdate(bulkActionType!, bulkActionValue)}
                onCancel={() => setIsBulkActionModalOpen(false)}
            >
                <Input
                    placeholder={bulkActionType === 'add_sector' ? 'Sector Name' : 'Watchlist Name'}
                    value={bulkActionValue}
                    onChange={(e) => setBulkActionValue(e.target.value)}
                />
            </Modal>

            {/* Demand Zones Drawer */}
            <Drawer
                title={`Demand Zones: ${currentTicker}`}
                placement="right"
                width={720}
                onClose={() => setIsDrawerOpen(false)}
                open={isDrawerOpen}
            >
                <Table
                    columns={zoneColumns}
                    dataSource={demandZones}
                    rowKey="_id"
                    loading={zonesLoading}
                    pagination={{ pageSize: 20 }}
                    size="small"
                />
            </Drawer>
        </div>
    );
}
