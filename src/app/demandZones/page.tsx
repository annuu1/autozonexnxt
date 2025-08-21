"use client";
import React, { useEffect, useState } from "react";
import Table from "@/components/ui/Table";

export default function DemandZonesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

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

  const columns = [
    { label: "Symbol", accessor: "ticker" },
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
    {
      label: "Trade Score",
      accessor: "trade_score",
      render: (val: any) => formatNumber(val),
    },
    {
      label: "Base Candles",
      accessor: "base_candles",
      render: (val: any) => formatNumber(val),
    },
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
