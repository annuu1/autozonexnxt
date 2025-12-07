"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "@/store/useAuthStore";

export interface Zone {
  key: string;
  ticker: string;
  pattern: string;
  proximal_line: number;
  distal_line: number;
  timeframes: string[];
  status: "approaching" | "entered";
  trade_score: number;
  rating: number;
  zone_id: string;
  freshness: number;
  timestamp: string;
}

// fallback sample zones (for dev/demo)
const fallbackZones: Zone[] = [
  {
    key: "1",
    ticker: "AUBANK",
    pattern: "RBR",
    proximal_line: 768.6,
    distal_line: 750.25,
    timeframes: ["1wk", "1d"],
    status: "approaching",
    trade_score: 0,
    rating: 9,
    zone_id: "AUBANK-1wk-2025-06-16T00:00:00+05:30",
    freshness: 0,
    timestamp: "2025-06-02T00:00:00+05:30",
  },
];

export function useScanner() {
  const user = useAuthStore((state) => state.user);

  // filters
  const [timeframe, setTimeframe] = useState<string>("all"); // default = all
  const [zoneFilter, setZoneFilter] = useState<"approaching" | "entered" | null>("approaching"); // default
  const [teamFilter, setTeamFilter] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [marketWatch, setMarketWatch] = useState<string>("all");
  const [sector, setSector] = useState<string>("");
  const [watchlist, setWatchlist] = useState<string>("");

  // fetch filters
  const { data: filters } = useQuery({
    queryKey: ["scanner-filters"],
    queryFn: async () => {
      const res = await fetch("/api/v1/scanner/filters");
      if (!res.ok) throw new Error("Failed to fetch filters");
      return res.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // fetch zones from API with filters
  const { data: zones = fallbackZones, isLoading, error } = useQuery<Zone[]>({
    queryKey: ["scanner", user?.id, timeframe, zoneFilter, search || "", marketWatch, sector, watchlist],
    queryFn: async () => {
      const params = new URLSearchParams({
        status: zoneFilter || "approaching",
        timeframe: timeframe || "all",
        market_watch: marketWatch,
      });

      if (search) params.append("search", search);
      if (sector) params.append("sector", sector);
      if (watchlist) params.append("watchlist", watchlist);

      const res = await fetch(`/api/v1/scanner?${params.toString()}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch zones");
      return res.json();
    },
    enabled: !!user, // only fetch if logged in
  });

  // apply team filter (local only)
  const filteredZones = useMemo(() => {
    return zones.filter((zone: Zone) => {
      if (teamFilter && zone.rating < 8) return false;
      return true;
    });
  }, [zones, teamFilter]);

  return {
    zones,
    filteredZones,
    isLoading,
    error,
    timeframe,
    setTimeframe,
    zoneFilter,
    setZoneFilter,
    teamFilter,
    setTeamFilter,
    search,
    setSearch,
    marketWatch,
    setMarketWatch,
    sector,
    setSector,
    watchlist,
    setWatchlist,
    filters: filters || { sectors: [], watchlists: [] },
  };
}
