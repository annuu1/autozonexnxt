import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Subscription {
  plan: string
  status: string
  startDate: string
  // Optional fields for plan duration/expiry tracking
  billingCycle?: "monthly" | "quarterly" | "yearly"
  endDate?: string
}

export interface User {
  id: string
  name: string
  email: string
  roles: string[]
  subscription?: Subscription
  other_channels?: any
}

interface AuthState {
  user: User | null
  setUser: (user: User) => void
  clearUser: () => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

// Zustand store with persist (saves to localStorage)
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      logout: async () => {
        try {
          await fetch("/api/v1/auth/logout", { method: "POST" }) // or DELETE, depends on your API
        } catch (e) {
          console.error("Logout failed", e)
        }
        set({ user: null })
      },
      refreshUser: async () => {
        try {
          const res = await fetch("/api/v1/auth/me")
          if (!res.ok) throw new Error("Failed to fetch user")
          const data = await res.json()
          set({ user: data })
        } catch (err) {
          console.error("Failed to refresh user", err)
          // optionally clear user if unauthorized
          set({ user: null })
        }
      },
    }),
    { name: "auth-storage" }
  )
)

export default useAuthStore
