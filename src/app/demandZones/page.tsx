"use client";

import { useEffect, useState } from "react";

interface DemandZone {
  _id: string;
  zone_id: string;
  base_candles: number;
  distal_line: number;
  proximal_line: number;
  ticker: string;
  pattern: string;
  freshness: number;
  trade_score: number;
  timeframes: string[];
  timestamp: string;
}

interface ApiResponse {
  data: DemandZone[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function DemandZonesPage() {
  const [zones, setZones] = useState<DemandZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // default rows per page
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchZones() {
      try {
        setLoading(true);
        const res = await fetch(`/api/demandZones?page=${page}&limit=${limit}`);
        const data: ApiResponse = await res.json();
        setZones(data.data);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Failed to fetch demand zones:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchZones();
  }, [page, limit]);

  if (loading) {
    return <p className="p-4">Loading demand zones...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Demand Zones</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Ticker</th>
              <th className="px-4 py-2 text-left">Pattern</th>
              <th className="px-4 py-2 text-left">Timeframe</th>
              <th className="px-4 py-2 text-left">Proximal</th>
              <th className="px-4 py-2 text-left">Distal</th>
              <th className="px-4 py-2 text-left">Freshness</th>
              <th className="px-4 py-2 text-left">Trade Score</th>
              <th className="px-4 py-2 text-left">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => (
              <tr key={zone._id} className="border-t">
                <td className="px-4 py-2">{zone.ticker}</td>
                <td className="px-4 py-2">{zone.pattern}</td>
                <td className="px-4 py-2">{zone.timeframes.join(", ")}</td>
                <td className="px-4 py-2">{zone.proximal_line.toFixed(2)}</td>
                <td className="px-4 py-2">{zone.distal_line.toFixed(2)}</td>
                <td className="px-4 py-2">{zone.freshness}</td>
                <td className="px-4 py-2">{zone.trade_score}</td>
                <td className="px-4 py-2">
                  {new Date(zone.timestamp).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
        
        {/* Rows per page selector */}
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            className="border rounded px-2 py-1"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1); // reset to first page when limit changes
            }}
          >
            {[10, 20, 50, 100, 200, 500, 1000].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Prev / Next pagination */}
        <div className="flex items-center gap-4">
          <button
            className="px-4 py-2 border rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            className="px-4 py-2 border rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
