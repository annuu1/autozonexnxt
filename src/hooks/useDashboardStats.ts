// hooks/useDashboardStats.ts
import { useQuery } from "@tanstack/react-query";

export function useDashboardStats(date?: string) {
  return useQuery({
    queryKey: ["dashboard-stats", date],
    queryFn: async () => {
      let url = "/api/v1/dashboard";
      if (date) url += `?date=${date}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });
}
