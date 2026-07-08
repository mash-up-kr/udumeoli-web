import { create } from "zustand"

import {
  JOIN_ERROR_CODES,
  JOIN_PREVIEW,
  MOCK_POTS,
  makeInviteCode,
} from "../api/pot.mock"
import type { JoinPreviewResult, TravelPot } from "./types"

interface PotState {
  pots: Array<TravelPot>
  currentPotId: string
  selectPot: (id: string) => void
  createPot: (name: string) => TravelPot
  previewJoin: (code: string) => JoinPreviewResult
  confirmJoin: (pot: TravelPot) => void
}

// 러프 단계 in-memory 목 스토어. 추후 entities/travel-pot/api로 GraphQL 교체.
export const usePotStore = create<PotState>((set, get) => ({
  pots: MOCK_POTS,
  currentPotId: MOCK_POTS[0].id,
  selectPot: (id) => set({ currentPotId: id }),
  createPot: (name) => {
    const pot: TravelPot = {
      id: `pot-${MOCK_POTS.length}-${name}`,
      name,
      inviteCode: makeInviteCode(),
      members: [{ id: "me", nickname: "나", profileImageUrl: null }],
    }
    set((s) => ({ pots: [...s.pots, pot], currentPotId: pot.id }))
    return pot
  },
  previewJoin: (code) => {
    if (get().pots.some((p) => p.inviteCode === code)) {
      return { status: "already_joined" }
    }
    if (code === JOIN_ERROR_CODES.notFound) return { status: "not_found" }
    if (code === JOIN_ERROR_CODES.full) return { status: "full" }
    return { status: "ok", pot: { ...JOIN_PREVIEW, inviteCode: code } }
  },
  confirmJoin: (pot) =>
    set((s) => ({
      pots: s.pots.some((p) => p.id === pot.id) ? s.pots : [...s.pots, pot],
      currentPotId: pot.id,
    })),
}))
