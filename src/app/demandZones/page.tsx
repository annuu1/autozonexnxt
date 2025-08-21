"use client";
import React, { useEffect, useState } from "react";
import Table from "@/components/ui/Table";

export default function DemandZonesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);


      // 🔹 Filter state
      const [proximalWithin, setProximalWithin] = useState<number>(3);
      const [compareTo, setCompareTo] = useState<"ltp" | "day_low">("ltp");
      const [useFilters, setUseFilters] = useState(false);

  // fetch zones
  useEffect(() => {
    const baseUrl = useFilters
      ? `/api/demand-zones/filters?page=${page}&limit=${rowsPerPage}&proximalWithin=${proximalWithin}&compareTo=${compareTo}`
      : `/api/demand-zones?page=${page}&limit=${rowsPerPage}`;

    fetch(baseUrl)
      .then((res) => res.json())
      .then((res) => {
        setZones(res.data);
        setTotal(res.total);
      });
  }, [page, rowsPerPage, useFilters, proximalWithin, compareTo]);

  const formatNumber = (val: any) =>
    typeof val === "number" ? val.toFixed(2) : val;

  // Handle symbol click → update last seen
  const handleSymbolClick = async (zone: any) => {
    try {
      const res = await fetch(`/api/demand-zones/${zone._id}/seen`, {
        method: "POST",
      });
      const updated = await res.json();

      // Grab last_seen from the API response
      const lastSeen = updated?.data?.last_seen ?? new Date().toISOString();

      // Update local state → add or overwrite last_seen
      setZones((prev) =>
        prev.map((z) =>
          z._id === zone._id
            ? {
                ...z,
                last_seen: lastSeen, // overwrites if exists, adds if missing
              }
            : z
        )
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

  const getDiffColor = (diff: number) => {
    if (diff < 0) return "text-red-600"; // proximal above ref
    if (diff <= 1) return "text-yellow-600";
    if (diff <= 3) return "text-green-600";
    return "text-gray-500";
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
    // ✅ Access nested symbol_data fields
    // ✅ LTP + % diff
  {
    label: "LTP",
    accessor: "symbol_data.ltp",
    render: (_: any, row: any) => {
      const ltp = row.symbol_data?.ltp;
      const proximal = row.proximal_line;
      if (!ltp || !proximal) return "-";

      const diff = ((ltp - proximal) / proximal) * 100;
      return (
        <div className="flex flex-col">
          <span>{formatNumber(ltp)}</span>
          <span className={`text-xs ${getDiffColor(diff)}`}>
            {diff.toFixed(2)}%
          </span>
        </div>
      );
    },
  },

  // ✅ Day Low + % diff
  {
    label: "Day Low",
    accessor: "symbol_data.day_low",
    render: (_: any, row: any) => {
      const dayLow = row.symbol_data?.day_low;
      const proximal = row.proximal_line;
      if (!dayLow || !proximal) return "-";

      const diff = ((dayLow - proximal) / proximal) * 100;
      return (
        <div className="flex flex-col">
          <span>{formatNumber(dayLow)}</span>
          <span className={`text-xs ${getDiffColor(diff)}`}>
            {diff.toFixed(2)}%
          </span>
        </div>
      );
    },
  },
];

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Demand Zones</h1>

      {/* 🔹 Filters */}
      <div className="mb-4 flex gap-4 items-center">
        <input
          type="number"
          value={proximalWithin}
          onChange={(e) => setProximalWithin(Number(e.target.value))}
          className="border px-2 py-1 rounded"
          placeholder="Enter %"
        />
        <select
          value={compareTo}
          onChange={(e) => setCompareTo(e.target.value as "ltp" | "day_low")}
          className="border px-2 py-1 rounded"
        >
          <option value="ltp">LTP</option>
          <option value="day_low">Day Low</option>
        </select>
        <button
          onClick={() => setUseFilters(true)}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Apply Filters
        </button>
        <button
          onClick={() => setUseFilters(false)}
          className="px-3 py-1 bg-gray-300 text-black rounded"
        >
          Clear
        </button>
      </div>

      {/* 🔹 Table */ }
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
