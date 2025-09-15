"use client";
import { useEffect, useState } from "react";
import { Modal, Tag, Pagination, Spin, Alert, Grid } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import Reactions from "@/components/ui/Reactions";

const { useBreakpoint } = Grid;

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
          setPage(1); // reset to first page when opening modal
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
                // ✅ Extract date from zone.zone_id
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
                      <div>Pattern: {zone.pattern}</div>
                      {formattedDate && <div>Date: {formattedDate}</div>}
                      <div>Proximal: {zone.proximal_line?.toFixed(2)}</div>
                      <div>Distal: {zone.distal_line?.toFixed(2)}</div>
                      <div>
                        Timeframes:{" "}
                        {(zone.timeframes || []).map((f: string) => (
                          <Tag key={f}>{f}</Tag>
                        ))}
                      </div>
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
