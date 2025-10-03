// hooks/useDashboardStats.ts
import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  users: number;
  demandZones: number;
  symbols: number;
  invalidSymbols: number;
  outdatedSymbols: number;
  zonesNearDayLow: number;
}

async function fetchFromRedis(cacheKey: string): Promise<DashboardStats | null> {
  try {
    const url = process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL;
    const token = process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      console.warn("Upstash Redis REST credentials not configured");
      return null;
    }

    const response = await fetch(`${url}/get/${cacheKey}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // Upstash returns { result: <value> } or { result: null }
    if (data.result) {
      return typeof data.result === 'string' 
        ? JSON.parse(data.result) 
        : data.result;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching from Redis:", error);
    return null;
  }
}

async function fetchFromServer(date?: string): Promise<DashboardStats> {
  let url = "/api/v1/dashboard";
  if (date) url += `?date=${date}`;
  
  const res = await fetch(url, {
    credentials: "include",
  });
  
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export function useDashboardStats(date?: string) {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats", date],
    queryFn: async () => {
      // Generate cache key (same format as server)
      const selectedDate = date ? new Date(date) : new Date();
      selectedDate.setHours(0, 0, 0, 0);
      const dateKey = selectedDate.toISOString().split("T")[0];
      const cacheKey = `dashboard-stats-${dateKey}`;

      // Try Redis first
      const cachedData = await fetchFromRedis(cacheKey);
      if (cachedData) {
        console.log("✅ Fetched from Redis cache");
        return cachedData;
      }

      // Fallback to server
      console.log("⚠️ Cache miss, fetching from server");
      return fetchFromServer(date);
    },
    staleTime: 4 * 60 * 60 * 1000, // 4 hours - match server cache
    gcTime: 4 * 60 * 60 * 1000, // Keep in React Query cache for 4 hours
  });
}