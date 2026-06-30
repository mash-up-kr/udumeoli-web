import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { User } from "./types"

interface SessionState {
  currentUser: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      login: (user) => set({ currentUser: user, isAuthenticated: true }),
      logout: () => set({ currentUser: null, isAuthenticated: false }),
    }),
    { name: "photato-session" }
  )
)
