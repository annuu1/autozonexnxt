"use client";
import { useEffect, useState } from "react";
import { Modal, Tag, Pagination, Spin, Alert, Grid, Space } from "antd";
import { BellOutlined, CopyOutlined, LockOutlined } from "@ant-design/icons";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import Reactions from "@/components/ui/Reactions";
import useAuthStore from "@/store/useAuthStore";
import QuickAlertModal from "../alerts/QuickAlertModal";

const { useBreakpoint } = Grid;

// Helper: tag colors for timeframes
const getTimeframeColor = (timeframe: string) => {
  switch (timeframe) {
    case "1wk":
      return "cyan";
    case "1mo":
      return "purple";
    case "3mo":
      return "orange";
    case "1d":
      return "blue";
    default:
      return "default";
  }
};

export default function TeamsPickModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const screens = useBreakpoint();
  const { copy, contextHolder } = useCopyToClipboard();
  const { user } = useAuthStore();

  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  });

  const isFreemium = user?.subscription?.plan === "freemium";

  const [quickAlertSymbol, setQuickAlertSymbol] = useState<string>("");
  const [quickAlertOpen, setQuickAlertOpen] = useState(false);

  // Fetch data when modal opens or pagination changes
  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);

      fetch(
        `/api/v1/teams-picks?page=${pagination.page}&pageSize=${pagination.pageSize}`
      )
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch team’s picks");
          return res.json();
        })
        .then((response) => {
          setZones(response.data || []);
          setPagination({
            page: response.pagination.page,
            pageSize: response.pagination.pageSize,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
          });
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, pagination.page, pagination.pageSize]);

  // Helpers
  function formatDate(dateString?: string): string | null {
    if (!dateString) return null;
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    }).format(new Date(dateString));
  }

  function InfoRow({
    label,
    value,
  }: {
    label: string;
    value?: string | number | null | React.ReactNode;
  }) {
    if (value === null || value === undefined) return null;
    return (
      <div>
        <span className="font-medium">{label}: </span>
        <span>{value}</span>
      </div>
    );
  }

  const openQuickAlert = (symbol: string) => {
    setQuickAlertSymbol(symbol);
    setQuickAlertOpen(true);
  };

  return (
    <>
      {contextHolder}
      <QuickAlertModal
        open={quickAlertOpen}
        onClose={() => setQuickAlertOpen(false)}
        initialSymbol={quickAlertSymbol}
      />
      <Modal
        title={`Team’s Pick Zones (${pagination.total})`}
        open={open}
        onCancel={onClose}
        footer={null}
        width="85%"
      >
        {loading ? (
          <Spin tip="Loading team’s picks..." />
        ) : error ? (
          <Alert type="error" message={error} />
        ) : zones.length === 0 ? (
          <Alert type="info" message="No team’s pick zones available" />
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: screens.xs
                  ? "1fr"
                  : "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "16px",
              }}
            >
              {zones.map((zone, idx) => {
                // Lock anything beyond 6th card for freemium users
                const locked = isFreemium && idx >= 6;

                const match = zone.zone_id?.match(/\d{4}-\d{2}-\d{2}/);
                const formattedDate = match
                  ? new Date(match[0]).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                  : null;

                return (
                  <div
                    key={zone._id}
                    className="relative p-3 border rounded-md bg-white shadow-sm overflow-hidden"
                  >
                    {/* Card Content */}
                    <div
                      style={{
                        opacity: locked ? 0.4 : 1,
                        filter: locked ? "blur(2px)" : "none",
                        pointerEvents: locked ? "none" : "auto",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <strong>{zone.ticker}</strong>
                          <Space size={4}>
                            {(zone.timeframes || []).map((f: string) => (
                              <Tag
                                key={f}
                                color={getTimeframeColor(f)}
                                style={{ margin: 0 }}
                              >
                                {f}
                              </Tag>
                            ))}
                          </Space>
                          <CopyOutlined
                            onClick={() => copy(zone.ticker)}
                            style={{ cursor: "pointer", color: "#555" }}
                          />
                          <BellOutlined
                            onClick={(e) => {
                              e.stopPropagation();
                              openQuickAlert(zone.ticker);
                            }}
                            style={{
                              cursor: "pointer",
                              color: "#1890ff",
                              fontSize: 16,
                            }}
                            title="Set price alert"
                          />
                        </div>
                        <Tag
                          color={zone.status === "entered" ? "green" : "blue"}
                        >
                          {zone.status?.toUpperCase()}
                        </Tag>
                      </div>

                      <div className="mt-2 text-sm text-gray-600 space-y-1">
                        <InfoRow
                          label="Added At"
                          value={formatDate(zone.teamPick?.createdAt)}
                        />
                        <InfoRow label="Legout" value={formattedDate} />
                        <InfoRow label="Pattern" value={zone.pattern} />
                        <InfoRow
                          label="Proximal"
                          value={zone.proximal_line?.toFixed(2)}
                        />
                        <InfoRow
                          label="Distal"
                          value={zone.distal_line?.toFixed(2)}
                        />
                        {zone.status === "approaching" &&
                          zone.percentDiff !== undefined && (
                            <InfoRow
                              label="Approach"
                              value={
                                <span
                                  style={{
                                    fontWeight: "bold",
                                    color: "#d46b08",
                                  }}
                                >
                                  {(zone.percentDiff * 100).toFixed(2)}%
                                </span>
                              }
                            />
                          )}
                      </div>

                      <div className="mt-2">
                        <Reactions
                          itemId={zone._id}
                          type="zone"
                          allItemIds={zones.map((z: any) => z._id)}
                          teamPickEnabled
                        />
                      </div>
                    </div>

                    {/* Lock Overlay for blurred cards */}
                    {locked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
                        <div className="text-center">
                          <LockOutlined style={{ fontSize: 28, color: "#555" }} />
                          <div className="mt-1 text-sm font-medium">
                            Upgrade to unlock
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Always show pagination */}
            <div className="flex justify-center mt-4">
              <Pagination
                current={pagination.page}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={(p, ps) =>
                  setPagination({ ...pagination, page: p, pageSize: ps })
                }
                size="small"
              />
            </div>

            {/* Upgrade notice for freemium */}
            {isFreemium && zones.length > 6 && (
              <div className="mt-4">
                <Alert
                  type="warning"
                  message="Upgrade Required"
                  description={
                    <div>
                      You are on a <strong>Freemium Plan</strong>. <br />
                      Only <strong>6 Team’s Picks</strong> are accessible per page. <br />
                      Please upgrade to unlock the full list.
                    </div>
                  }
                  showIcon
                />
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
}
