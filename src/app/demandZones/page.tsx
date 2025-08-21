"use client";
import React, { useEffect, useState } from "react";
import Table from "@/components/ui/Table";

export default function DemandZonesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // fetch demand zones
  useEffect(() => {
    fetch(`/api/demand-zones?page=${page}&limit=${rowsPerPage}`)
      .then((res) => res.json())
      .then((res) => {
        setZones(res.data);
        setTotal(res.total);
      });
  }, [page, rowsPerPage]);

  const formatNumber = (val: any) =>
    typeof val === "number" ? val.toFixed(2) : val;

  // Handle symbol click → update last seen
  const handleSymbolClick = async (zone: any) => {
    try {
      const res = await fetch(`/api/demand-zones/${zone._id}/seen`, {
        method: "POST",
      });
      const updated = await res.json();

      // Update local state instantly
      setZones((prev) =>
        prev.map((z) => (z._id === zone._id ? { ...z, last_seen: updated.last_seen } : z))
      );
    } catch (err) {
      console.error("Error updating last seen:", err);
    }
  };

  // Get label + color by date
  const getLastSeenLabel = (lastSeen: string | null) => {
    if (!lastSeen) return { text: "New", color: "text-blue-600" };

    const seenDate = new Date(lastSeen);
    const today = new Date();
    const diffDays = Math.floor(
      (today.getTime() - seenDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0)
      return { text: seenDate.toLocaleDateString(), color: "text-green-600" };
    if (diffDays <= 3)
      return { text: seenDate.toLocaleDateString(), color: "text-lime-600" };
    if (diffDays <= 10)
      return { text: seenDate.toLocaleDateString(), color: "text-red-500" };

    return { text: seenDate.toLocaleDateString(), color: "text-red-800" };
  };

  const columns = [
    {
      label: "Symbol",
      accessor: "ticker",
      render: (_: any, row: any) => {
        const { text, color } = getLastSeenLabel(row.last_seen);
        return (
          <button
            onClick={() => handleSymbolClick(row)}
            className="flex flex-col text-left hover:underline"
          >
            <span className="font-semibold">{row.ticker}</span>
            <span className={`text-xs ${color}`}>{text}</span>
          </button>
        );
      },
    },
    { label: "Timeframe", accessor: "timeframes" },
    { label: "Pattern", accessor: "pattern" },
    {
      label: "Proximal Line",
      accessor: "proximal_line",
      render: (val: any) => formatNumber(val),
    },
    {
      label: "Distal Line",
      accessor: "distal_line",
      render: (val: any) => formatNumber(val),
    },
    { label: "Freshness", accessor: "freshness" },
    { label: "Trade Score", accessor: "trade_score" },
    { label: "Base Candles", accessor: "base_candles" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Demand Zones</h1>
      <Table
        columns={columns}
        data={zones}
        page={page}
        rowsPerPage={rowsPerPage}
        total={total}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        actions={(row) => (
          <div className="flex gap-2">
            <button className="px-2 py-1 border rounded text-blue-600">
              Edit
            </button>
            <button className="px-2 py-1 border rounded text-red-600">
              Delete
            </button>
          </div>
        )}
      />
    </div>
  );
}
