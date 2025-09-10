import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Subscription {
  plan: string
  status: string
  startDate: string
}

export interface User {
  id: string
  name: string
  email: string
  roles: string[]
  subscription?: Subscription
}

interface AuthState {
  user: User | null
  setUser: (user: User) => void
  clearUser: () => void
  logout: () => Promise<void>
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
    }),
    { name: "auth-storage" }
  )
)

export default useAuthStore
