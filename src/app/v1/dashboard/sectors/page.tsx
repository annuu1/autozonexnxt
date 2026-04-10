"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Typography,
    Spin,
    Alert,
    Grid,
    Card,
    Tag,
    Space,
    Button,
    Select,
    Drawer,
    Descriptions,
} from "antd";
import {
    CopyOutlined,
    BellOutlined,
    LockOutlined,
} from "@ant-design/icons";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import Reactions from "@/components/ui/Reactions";
import QuickAlertModal from "@/components/alerts/QuickAlertModal";
import useAuthStore from "@/store/useAuthStore";
import ZoneCard from "@/components/common/ZoneCard";

const { Title } = Typography;
const { useBreakpoint } = Grid;

const getTimeframeColor = (timeframe: string) => {
    switch (timeframe) {
        case "1wk": return "cyan";
        case "1mo": return "purple";
        case "3mo": return "orange";
        case "1d": return "blue";
        default: return "default";
    }
};

export default function SectorsPage() {
    const screens = useBreakpoint();
    const { copy, contextHolder } = useCopyToClipboard();
    const { user } = useAuthStore();

    const [timeframe, setTimeframe] = useState<string>("all");
    const [zoneFilter, setZoneFilter] = useState<"approaching" | "entered" | null>("approaching");
    const [selectedZone, setSelectedZone] = useState<any>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [quickAlertSymbol, setQuickAlertSymbol] = useState<string>("");
    const [quickAlertOpen, setQuickAlertOpen] = useState(false);

    // Fetch zones grouped by sector
    const { data: sectorsData, isLoading, error } = useQuery({
        queryKey: ["sectors-zones", timeframe, zoneFilter],
        queryFn: async () => {
            const params = new URLSearchParams({
                status: zoneFilter || "approaching",
                timeframe: timeframe || "all",
            });

            const res = await fetch(`/api/v1/scanner/sectors?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch sector zones");
            return res.json();
        },
    });

    const handleCardClick = (zone: any) => {
        setSelectedZone(zone);
        setDrawerOpen(true);
    };

    const openQuickAlert = (symbol: string) => {
        setQuickAlertSymbol(symbol);
        setQuickAlertOpen(true);
    };

    return (
        <div style={{ padding: screens.xs ? 12 : 20 }}>
            {contextHolder}
            <QuickAlertModal
                open={quickAlertOpen}
                onClose={() => setQuickAlertOpen(false)}
                initialSymbol={quickAlertSymbol}
            />

            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <Title level={3} style={{ margin: 0 }}>Sector Analysis</Title>

                    <Space wrap>
                        <Select
                            value={timeframe}
                            onChange={setTimeframe}
                            style={{ width: 150 }}
                            options={[
                                { value: "all", label: "All Timeframes" },
                                { value: "1wk", label: "1 Week" },
                                { value: "1mo", label: "1 Month" },
                                { value: "3mo", label: "3 Months" },
                            ]}
                        />

                        <Button
                            type={zoneFilter === "approaching" ? "primary" : "default"}
                            onClick={() => setZoneFilter(zoneFilter === "approaching" ? null : "approaching")}
                        >
                            Approaching
                        </Button>

                        <Button
                            type={zoneFilter === "entered" ? "primary" : "default"}
                            onClick={() => setZoneFilter(zoneFilter === "entered" ? null : "entered")}
                        >
                            Entered
                        </Button>
                    </Space>
                </div>

                {isLoading ? (
                    <Spin tip="Loading sectors..." fullscreen />
                ) : error ? (
                    <Alert type="error" message="Failed to fetch data" />
                ) : !sectorsData || Object.keys(sectorsData).length === 0 ? (
                    <Alert type="info" message="No zones found for current filters" />
                ) : (
                    Object.entries(sectorsData).map(([sector, zones]: [string, any]) => (
                        <Card
                            key={sector}
                            title={<span style={{ fontSize: 18, fontWeight: 600 }}>{sector} <Tag color="blue">{zones.length}</Tag></span>}
                            style={{ marginBottom: 24, background: '#f8f9fa' }}
                            bodyStyle={{ padding: 16 }}
                        >
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: screens.xs
                                        ? "1fr"
                                        : "repeat(auto-fill, minmax(280px, 1fr))",
                                    gap: "16px",
                                }}
                            >
                                {zones.map((zone: any) => (
                                    <ZoneCard
                                        key={zone._id}
                                        zone={zone}
                                        variant="sector"
                                        onClick={handleCardClick}
                                        onCopy={copy}
                                        onAlert={openQuickAlert}
                                        allItemIds={zones.map((z: any) => z._id)}
                                    />
                                ))}
                            </div>
                        </Card>
                    ))
                )}

                <Drawer
                    title={`Zone Details: ${selectedZone?.ticker}`}
                    placement="right"
                    onClose={() => setDrawerOpen(false)}
                    open={drawerOpen}
                    width={screens.xs ? "100%" : 400}
                >
                    {selectedZone && (
                        <Descriptions column={1} bordered size="small">
                            {Object.entries(selectedZone).map(([key, value]) => {
                                if (['symbol', 'isApproaching', 'isEntered', '_id', '__v'].includes(key)) return null;
                                return (
                                    <Descriptions.Item key={key} label={key}>
                                        {Array.isArray(value) ? value.join(", ") : typeof value === 'object' ? JSON.stringify(value) : value?.toString()}
                                    </Descriptions.Item>
                                )
                            })}
                        </Descriptions>
                    )}
                </Drawer>
            </Space>
        </div>
    );
}
