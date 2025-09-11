"use client"

import { useQuery } from "@tanstack/react-query"
import useAuthStore from "@/store/useAuthStore"

interface ReportData {
  users: number
  demandZones: number
  symbols: number
  invalidSymbols: number
  outdatedSymbols: number
  zonesNearDayLow: number
}

export function useDashboardReport(date?: string) {
  const user = useAuthStore((state) => state.user)

  return useQuery<ReportData>({
    queryKey: ["dashboard-report", date],
    queryFn: async () => {
      const res = await fetch(`/api/v1/dashboard/report?date=${date ?? ""}`, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // send cookies/session if required
      })
      if (!res.ok) {
        throw new Error("Failed to fetch dashboard report")
      }
      return res.json()
    },
    enabled: !!user, // only run query if user is logged in
  })
}
