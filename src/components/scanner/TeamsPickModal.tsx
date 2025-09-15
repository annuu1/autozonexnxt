"use client";
import { useEffect, useState } from "react";
import { Modal, Tag, Pagination, Spin, Alert, Grid, Space } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import Reactions from "@/components/ui/Reactions";

const { useBreakpoint } = Grid;

// Helper function to get color for timeframe tags
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

  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 20; // ✅ show 20 cards per page
  const paginatedZones = zones?.slice((page - 1) * pageSize, page * pageSize);

  // Fetch data when modal opens
  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);

      fetch("/api/v1/teams-picks")
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch team’s picks");
          return res.json();
        })
        .then((data) => {
          setZones(data || []);
          setPage(1);
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open]);

  return (
    <>
      {contextHolder}
      <Modal
        title="Team’s Pick Zones"
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
            {/* Simple Grid Layout */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: screens.xs
                  ? "1fr"
                  : "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "16px",
              }}
            >
              {paginatedZones?.map((zone) => {
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
                    className="p-3 border rounded-md bg-white shadow-sm"
                    style={{
                      transition: "transform 0.15s ease-in-out, box-shadow 0.15s",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <strong>{zone.ticker}</strong>
                        {/* MOVED & UPDATED: Timeframes with colors */}
                        <Space size={4}>
                            {(zone.timeframes || []).map((f: string) => (
                              <Tag key={f} color={getTimeframeColor(f)} style={{ margin: 0 }}>{f}</Tag>
                            ))}
                        </Space>
                        <CopyOutlined
                          onClick={() => copy(zone.ticker)}
                          style={{ cursor: "pointer", color: "#555" }}
                        />
                      </div>
                      <Tag color={zone.status === "entered" ? "green" : "blue"}>
                        {zone.status?.toUpperCase()}
                      </Tag>
                    </div>

                    <div className="mt-2 text-sm text-gray-600">
                      {formattedDate && <div>Date: {formattedDate}</div>}
                      <div>Pattern: {zone.pattern}</div>
                      <div>Proximal: {zone.proximal_line?.toFixed(2)}</div>
                      <div>Distal: {zone.distal_line?.toFixed(2)}</div>
                       {/* NEW: Display percentDiff */}
                       {zone.status === 'approaching' && zone.percentDiff !== undefined && (
                          <div>
                            Approach:{" "}
                            <span style={{ fontWeight: "bold", color: "#d46b08" }}>
                              {(zone.percentDiff * 100).toFixed(2)}%
                            </span>
                          </div>
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
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-4">
              <Pagination
                current={page}
                pageSize={pageSize}
                total={zones.length}
                onChange={(p) => setPage(p)}
                size="small"
              />
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
