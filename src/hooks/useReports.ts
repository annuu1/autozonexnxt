// hooks/useReports.ts
import { useQuery } from "@tanstack/react-query";

interface ReportsParams {
  date?: string;
  includeHistory?: boolean;
  page?: number;
  limit?: number;
}

async function fetchReports(params: ReportsParams = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.date) queryParams.append("date", params.date);
  if (params.includeHistory) queryParams.append("includeHistory", "true");
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());

  const url = `/api/v1/dashboard/report${queryParams.toString() ? `?${queryParams}` : ""}`;
  
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error("Failed to fetch reports");
  }
  
  return res.json();
}

export function useReports(params: ReportsParams = {}) {
  return useQuery({
    queryKey: ["reports", params],
    queryFn: () => fetchReports(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}