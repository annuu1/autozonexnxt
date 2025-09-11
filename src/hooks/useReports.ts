// hooks/useReports.ts
"use client"

import { useQuery } from "@tanstack/react-query"
import useAuthStore from "@/store/useAuthStore"

export interface ZoneRow {
  id: string
  range: string
  time: string
  strength?: string
  holding?: boolean
  reaction?: string
  notes?: string
  entry?: string
}

export interface ReportsResponse {
  today: {
    approaching: ZoneRow[]
    entered: ZoneRow[]
    breached: ZoneRow[]
  }
  history: Record<
    string,
    {
      approaching?: ZoneRow[]
      entered?: ZoneRow[]
      breached?: ZoneRow[]
    }
  >
}

export function useReports() {
  const user = useAuthStore((state) => state.user)

  return useQuery<ReportsResponse>({
    queryKey: ["reports"],
    queryFn: async () => {
      const res = await fetch("/api/v1/dashboard/report", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
      if (!res.ok) {
        throw new Error("Failed to fetch reports")
      }
      return res.json()
    },
    enabled: !!user, // don’t fetch if not logged in
  })
}
