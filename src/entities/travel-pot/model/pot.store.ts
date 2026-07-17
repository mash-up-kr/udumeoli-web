import { create } from "zustand"

import {
  JOIN_ERROR_CODES,
  JOIN_PREVIEW,
  MOCK_POTS,
  UT_POT,
  makeInviteCode,
} from "../api/pot.mock"
import type { JoinPreviewResult, PotMember, TravelPot } from "./types"

interface PotState {
  pots: Array<TravelPot>
  currentPotId: string
  seedUtPot: () => void
  selectPot: (id: string) => void
  createPot: (name: string, creator: PotMember) => TravelPot
  leaveAllPots: (memberId: string) => void
  previewJoin: (code: string) => JoinPreviewResult
  confirmJoin: (pot: TravelPot) => void
}

// 러프 단계 in-memory 목 스토어. 추후 entities/travel-pot/api로 GraphQL 교체.
export const usePotStore = create<PotState>((set, get) => ({
  // 신규 유저 기준 빈 상태로 시작 — 목 팟은 UT 데이터 시드로만 주입
  pots: [],
  currentPotId: "",
  // UT용 팟 주입 — 사용자가 직접 만든 팟은 유지하고 UT 팟을 추가·선택
  seedUtPot: () =>
    set((s) => ({
      pots: s.pots.some((p) => p.id === UT_POT.id)
        ? s.pots
        : [...s.pots, UT_POT],
      currentPotId: UT_POT.id,
    })),
  selectPot: (id) => set({ currentPotId: id }),
  // 생성자(세션 유저)를 첫 멤버로 — id가 세션과 일치해야 내 슬롯으로 인식된다
  createPot: (name, creator) => {
    const pot: TravelPot = {
      id: `pot-${MOCK_POTS.length}-${name}`,
      name,
      inviteCode: makeInviteCode(),
      members: [creator],
    }
    set((s) => ({ pots: [...s.pots, pot], currentPotId: pot.id }))
    return pot
  },
  // 계정 삭제 정책: 속한 모든 여행팟에서 탈퇴(자리는 공석), 여행팟 자체는 유지.
  leaveAllPots: (memberId) =>
    set((s) => ({
      pots: s.pots.map((p) => ({
        ...p,
        members: p.members.filter((m) => m.id !== memberId),
      })),
    })),
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
