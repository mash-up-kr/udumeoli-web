import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { User } from "./types"
import { USE_MOCK } from "@/shared/api/client"

interface SessionState {
  currentUser: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (partial: Partial<User>) => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      login: (user) => set({ currentUser: user, isAuthenticated: true }),
      logout: () => set({ currentUser: null, isAuthenticated: false }),
      updateUser: (partial) =>
        set((s) => ({
          currentUser: s.currentUser
            ? { ...s.currentUser, ...partial }
            : s.currentUser,
        })),
    }),
    // 목↔실서버 persist 분리 — 실서버 me 응답이 목 세션을 덮어쓰지 않게 한다
    { name: USE_MOCK ? "photato-session-mock" : "photato-session" }
  )
)
