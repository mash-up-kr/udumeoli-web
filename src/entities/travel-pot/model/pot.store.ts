import { create } from "zustand"

import {
  JOIN_ERROR_CODES,
  JOIN_PREVIEW,
  MOCK_POTS,
  UT_POTS,
  makeInviteCode,
} from "../api/pot.mock"
import type { JoinPreviewResult, PotMember, TravelPot } from "./types"

interface PotState {
  pots: Array<TravelPot>
  currentPotId: string
  seedUtPots: () => void
  selectPot: (id: string) => void
  createPot: (name: string, creator: PotMember) => TravelPot
  resetPots: () => void
  previewJoin: (code: string) => JoinPreviewResult
  confirmJoin: (pot: TravelPot) => void
}

// 팟 미선택/미존재 시에도 안정 참조를 반환하기 위한 상수 — 셀렉터가 매번
// 새 배열을 만들면 useSyncExternalStore가 무한 리렌더에 빠진다
const EMPTY_MEMBERS: Array<PotMember> = []

/** 현재 선택된 팟의 멤버 목록 (팟이 없으면 안정된 빈 배열) */
export const selectCurrentPotMembers = (s: PotState): Array<PotMember> =>
  s.pots.find((p) => p.id === s.currentPotId)?.members ?? EMPTY_MEMBERS

// 러프 단계 in-memory 목 스토어. 추후 entities/travel-pot/api로 GraphQL 교체.
export const usePotStore = create<PotState>((set, get) => ({
  // 신규 유저 기준 빈 상태로 시작 — 목 팟은 UT 데이터 시드로만 주입
  pots: [],
  currentPotId: "",
  // UT용 팟 3개 주입 — 사용자가 직접 만든 팟은 유지하고 UT 팟을 추가, 첫 팟(딸깍) 선택
  seedUtPots: () =>
    set((s) => ({
      pots: [
        ...s.pots,
        ...UT_POTS.filter((u) => !s.pots.some((p) => p.id === u.id)),
      ],
      currentPotId: UT_POTS[0].id,
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
  // 계정 삭제 시 로컬 팟 상태 전체 초기화 — 재가입하면 신규 유저 기준 빈 상태로 시작
  resetPots: () => set({ pots: [], currentPotId: "" }),
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
