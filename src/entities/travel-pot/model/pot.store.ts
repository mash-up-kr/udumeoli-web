import * as React from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import {
  ALBUM_POT,
  JOIN_ERROR_CODES,
  JOIN_PREVIEW,
  UT_POTS,
  makeInviteCode,
} from "../api/pot.mock"
import type { JoinPreviewResult, PotMember, TravelPot } from "./types"
import { USE_MOCK } from "@/shared/api/client"

interface PotState {
  pots: Array<TravelPot>
  currentPotId: string
  seedUtPots: () => void
  replacePots: (pots: Array<TravelPot>) => void
  selectPot: (id: string) => void
  createPot: (name: string, creator: PotMember) => TravelPot
  renamePot: (id: string, name: string) => void
  deletePot: (id: string) => void
  leavePot: (id: string, memberId: string) => void
  leaveAllByMember: (memberId: string) => void
  resetPots: () => void
  previewJoin: (code: string, memberId?: string | null) => JoinPreviewResult
  confirmJoin: (pot: TravelPot, member?: PotMember) => void
}

// 팟 미선택/미존재 시에도 안정 참조를 반환하기 위한 상수 — 셀렉터가 매번
// 새 배열을 만들면 useSyncExternalStore가 무한 리렌더에 빠진다
const EMPTY_MEMBERS: Array<PotMember> = []
const POT_CAPACITY = 6

function todayStamp(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function makePotId(): string {
  return `pot-${globalThis.crypto.randomUUID()}`
}

export function potHasMember(
  pot: TravelPot,
  memberId: string | null | undefined
): boolean {
  return !!memberId && pot.members.some((member) => member.id === memberId)
}

export function getMemberPots(
  pots: Array<TravelPot>,
  memberId: string | null | undefined
): Array<TravelPot> {
  if (!memberId) return []
  return pots.filter((pot) => potHasMember(pot, memberId))
}

/** 현재 선택된 팟의 멤버 목록 (팟이 없으면 안정된 빈 배열) */
export const selectCurrentPotMembers = (s: PotState): Array<PotMember> =>
  s.pots.find((p) => p.id === s.currentPotId)?.members ?? EMPTY_MEMBERS

// 러프 단계 목 스토어. localStorage에 persist — 안 하면 새로고침마다 팟이 사라져
// 기존 팟 보유 유저까지 매번 /pot-start로 튕기는 문제가 생긴다. 추후 GraphQL 교체.
export const usePotStore = create<PotState>()(
  persist(
    (set, get) => ({
      // 팟 없음이 기본 상태 — 신규 유저는 /pot-start에서 직접 만들거나 참여해야 한다
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
      replacePots: (pots) =>
        set((s) => ({
          pots,
          currentPotId: pots.some((pot) => pot.id === s.currentPotId)
            ? s.currentPotId
            : (pots.at(0)?.id ?? ""),
        })),
      selectPot: (id) => set({ currentPotId: id }),
      // 생성자(세션 유저)를 첫 멤버로 — id가 세션과 일치해야 내 슬롯으로 인식된다
      createPot: (name, creator) => {
        const pot: TravelPot = {
          id: makePotId(),
          name,
          inviteCode: makeInviteCode(),
          members: [creator],
          joinedAt: todayStamp(),
        }
        set((s) => ({ pots: [...s.pots, pot], currentPotId: pot.id }))
        return pot
      },
      renamePot: (id, name) =>
        set((s) => ({
          pots: s.pots.map((pot) =>
            pot.id === id ? { ...pot, name: name.trim() } : pot
          ),
        })),
      deletePot: (id) =>
        set((s) => ({
          pots: s.pots.filter((pot) => pot.id !== id),
          currentPotId: s.currentPotId === id ? "" : s.currentPotId,
        })),
      leavePot: (id, memberId) =>
        set((s) => {
          const pots = s.pots.map((pot) => {
            if (pot.id !== id) return pot

            const members = pot.members.filter((m) => m.id !== memberId)
            const removed = pot.members.length - members.length

            return removed > 0
              ? {
                  ...pot,
                  members,
                  vacantSlots: (pot.vacantSlots ?? 0) + removed,
                }
              : pot
          })

          return {
            pots,
            currentPotId:
              s.currentPotId === id
                ? (getMemberPots(pots, memberId).at(0)?.id ?? "")
                : s.currentPotId,
          }
        }),
      // 계정 삭제/탈퇴 시 사용자를 모든 팟에서 제거한다. 팟은 유지하고 제거된 인원만
      // vacantSlots로 남겨 백엔드의 "공석 전환" 동작과 같은 의미를 보존한다.
      leaveAllByMember: (memberId) =>
        set((s) => {
          const pots = s.pots.map((pot) => {
            const members = pot.members.filter((m) => m.id !== memberId)
            const removed = pot.members.length - members.length
            return removed > 0
              ? {
                  ...pot,
                  members,
                  vacantSlots: (pot.vacantSlots ?? 0) + removed,
                }
              : pot
          })

          return { pots, currentPotId: "" }
        }),
      // 계정 삭제 시 로컬 팟 상태 초기화 — 재가입하면 신규 유저 기준 팟 없는 상태로 시작
      resetPots: () => set({ pots: [], currentPotId: "" }),
      previewJoin: (code, memberId) => {
        const existingPot = get().pots.find((p) => p.inviteCode === code)
        if (existingPot) {
          if (!memberId || potHasMember(existingPot, memberId)) {
            return { status: "already_joined" }
          }
          if (
            existingPot.members.length >= POT_CAPACITY &&
            (existingPot.vacantSlots ?? 0) <= 0
          ) {
            return { status: "full" }
          }
          return { status: "ok", pot: existingPot }
        }
        if (code === JOIN_ERROR_CODES.notFound) return { status: "not_found" }
        if (code === JOIN_ERROR_CODES.full) return { status: "full" }
        return { status: "ok", pot: { ...JOIN_PREVIEW, inviteCode: code } }
      },
      confirmJoin: (pot, member) =>
        set((s) => {
          const existingPot = s.pots.find((p) => p.id === pot.id)
          if (existingPot) {
            const pots = s.pots.map((p) => {
              if (p.id !== pot.id) return p
              if (!member || potHasMember(p, member.id)) return p
              if (
                p.members.length >= POT_CAPACITY &&
                (p.vacantSlots ?? 0) <= 0
              ) {
                return p
              }
              return {
                ...p,
                members: [...p.members, member],
                joinedAt: todayStamp(),
                vacantSlots: Math.max(0, (p.vacantSlots ?? 0) - 1),
              }
            })
            return { pots, currentPotId: pot.id }
          }

          return {
            pots: [
              ...s.pots,
              {
                ...pot,
                members:
                  member && !pot.members.some((m) => m.id === member.id)
                    ? [...pot.members, member]
                    : pot.members,
                joinedAt: todayStamp(),
              },
            ],
            currentPotId: pot.id,
          }
        }),
    }),
    {
      name: "photato-pots",
      // 목 모드 한정: 온보딩을 마친(팟이 하나라도 있는) 유저에게 앨범 목데이터용
      // 4인 팟(우두머리)을 1회 주입하고 선택한다. 빈 상태에는 넣지 않아
      // 신규 유저의 /pot-start 온보딩 흐름은 그대로 유지된다.
      merge: (persisted, current) => {
        const state = { ...current, ...(persisted as Partial<PotState>) }
        if (
          USE_MOCK &&
          state.pots.length > 0 &&
          !state.pots.some((p) => p.id === ALBUM_POT.id)
        ) {
          return {
            ...state,
            pots: [...state.pots, ALBUM_POT],
            currentPotId: ALBUM_POT.id,
          }
        }
        return state
      },
    }
  )
)

// persist 미들웨어가 localStorage에서 복원을 마치기 전엔 pots가 항상 빈 배열이라,
// 그 순간에 "팟 없음"으로 오판해 기존 팟 보유 유저를 /pot-start로 잘못 리다이렉트할 수 있다.
// 복원 완료 전까지는 판정을 보류한다 (features/auth의 useSessionHydrated와 동일 패턴).
export function usePotsHydrated() {
  const [hydrated, setHydrated] = React.useState(false)
  React.useEffect(() => {
    const persistApi = usePotStore.persist as
      | typeof usePotStore.persist
      | undefined
    if (persistApi?.hasHydrated() ?? true) {
      setHydrated(true)
      return
    }
    return persistApi?.onFinishHydration(() => setHydrated(true))
  }, [])
  return hydrated
}
