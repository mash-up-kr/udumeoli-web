import { create } from "zustand"

import { JOIN_PREVIEW, MOCK_POTS, makeInviteCode } from "../api/pot.mock"
import type { TravelPot } from "./types"

interface PotState {
  pots: Array<TravelPot>
  currentPotId: string
  selectPot: (id: string) => void
  createPot: (name: string) => TravelPot
  previewJoin: (code: string) => TravelPot
  confirmJoin: (pot: TravelPot) => void
}

// 러프 단계 in-memory 목 스토어. 추후 entities/travel-pot/api로 GraphQL 교체.
export const usePotStore = create<PotState>((set) => ({
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
  previewJoin: (code) => ({ ...JOIN_PREVIEW, inviteCode: code }),
  confirmJoin: (pot) =>
    set((s) => ({
      pots: s.pots.some((p) => p.id === pot.id) ? s.pots : [...s.pots, pot],
      currentPotId: pot.id,
    })),
}))
