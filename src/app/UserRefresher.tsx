"use client"

import { useEffect } from "react"
import useAuthStore from "@/store/useAuthStore"

export default function UserRefresher() {
  const refreshUser = useAuthStore((state) => state.refreshUser)

  useEffect(() => {
    // ✅ Run after Zustand has finished rehydrating localStorage
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      refreshUser()
    })
    refreshUser()

    return () => {
      unsub()
    }
  }, [refreshUser])

  return null
}
