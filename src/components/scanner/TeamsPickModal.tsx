"use client";
import { useEffect, useState } from "react";
import { Modal, Table, Tag, Pagination, Spin, Alert, Grid } from "antd";
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
  const pageSize = 5;

  const paginatedZones = zones?.slice((page - 1) * pageSize, page * pageSize);

  // 🔥 Fetch data when modal opens
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
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open]);

  const columns = [
    {
      title: "Ticker",
      dataIndex: "ticker",
      key: "ticker",
      render: (ticker: string) => (
        <strong>
          {ticker}
          <CopyOutlined
            onClick={() => copy(ticker)}
            style={{ cursor: "pointer", color: "#555", marginLeft: 8 }}
          />
        </strong>
      ),
    },
    { title: "Pattern", dataIndex: "pattern", key: "pattern" },
    {
      title: "Proximal",
      dataIndex: "proximal_line",
      key: "proximal_line",
      render: (v: number) => v?.toFixed(2),
    },
    {
      title: "Distal",
      dataIndex: "distal_line",
      key: "distal_line",
      render: (v: number) => v?.toFixed(2),
    },
    {
      title: "TimeFrames",
      dataIndex: "timeframes",
      key: "timeframes",
      render: (timeframes: string[]) => (
        <Tag color={timeframes.length > 0 ? "blue" : "blue"}>
          {timeframes.join(", ")}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, row: any) => (
        <Reactions
          itemId={row._id}
          type="zone"
          allItemIds={zones.map((z: any) => z._id)}
          teamPickEnabled
        />
      ),
    },
  ];

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
        ) : screens.xs ? (
          // 📱 Mobile → Card layout
          <>
            <div className="space-y-3">
              {paginatedZones?.map((zone) => (
                <div
                  key={zone._id}
                  className="p-3 border rounded-md bg-white shadow-sm"
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
                    <div>Proximal: {zone.proximal_line?.toFixed(2)}</div>
                    <div>Distal: {zone.distal_line?.toFixed(2)}</div>
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
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <Pagination
                current={page}
                pageSize={pageSize}
                total={zones?.length}
                onChange={(p) => setPage(p)}
                size="small"
              />
            </div>
          </>
        ) : (
          // 💻 Desktop → Table
          <Table
            dataSource={zones}
            columns={columns}
            rowKey="_id"
            bordered
            pagination={{ pageSize: 10 }}
          />
        )}
      </Modal>
    </>
  );
}
