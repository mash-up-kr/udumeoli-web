import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getMemberPots, usePotStore } from "../model/pot.store"
import {
  createParty,
  deleteParty,
  fetchMyParties,
  fetchPartyMapOverview,
  joinParty,
  leaveParty,
} from "./pot.api"
import type { TravelPot } from "../model/types"
import type { QueryOptions } from "@/shared/api/client"
import { USE_MOCK } from "@/shared/api/client"

export const travelPotKeys = {
  all: ["travel-pot"] as const,
  myParties: () => [...travelPotKeys.all, "my-parties"] as const,
  mapOverview: (partyId: string) =>
    [...travelPotKeys.all, "map-overview", partyId] as const,
}

export function useMyParties(options: QueryOptions = {}) {
  return useQuery({
    queryKey: travelPotKeys.myParties(),
    queryFn: fetchMyParties,
    ...options,
  })
}

export function usePartyMapOverview(partyId: string) {
  return useQuery({
    queryKey: travelPotKeys.mapOverview(partyId),
    queryFn: () => fetchPartyMapOverview(partyId),
    enabled: Boolean(partyId) && !USE_MOCK,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })
}

/** 생성·참여 결과를 목록 맨 앞에 반영 — 최근 입장 팟이 최상단 (Figma 1959-5326 #2) */
function useUpsertingMutation(
  mutationFn: (input: string) => Promise<TravelPot>
) {
  const queryClient = useQueryClient()
  const replacePots = usePotStore((s) => s.replacePots)
  return useMutation({
    mutationFn,
    onSuccess: (pot) => {
      const cached =
        queryClient.getQueryData<Array<TravelPot>>(travelPotKeys.myParties()) ??
        []
      const pots = [pot, ...cached.filter((existing) => existing.id !== pot.id)]
      queryClient.setQueryData(travelPotKeys.myParties(), pots)
      replacePots(pots)
    },
  })
}

export function useCreateParty() {
  return useUpsertingMutation(createParty)
}

export function useJoinParty() {
  return useUpsertingMutation(joinParty)
}

/** 팟 나가기 — 성공 시 캐시에선 팟을 빼고, store에선 내 자리만 비운다(목 공석 규칙 유지). */
export function useLeaveParty() {
  const queryClient = useQueryClient()
  const leavePot = usePotStore((s) => s.leavePot)
  return useMutation({
    mutationFn: async ({ potId }: { potId: string; memberId: string }) => {
      if (!USE_MOCK) await leaveParty(potId)
    },
    onSuccess: (_, { potId, memberId }) => {
      leavePot(potId, memberId)
      queryClient.setQueryData<Array<TravelPot>>(
        travelPotKeys.myParties(),
        (pots) => pots?.filter((pot) => pot.id !== potId)
      )
    },
  })
}

/** 팟 삭제 (owner 전용) — 성공 시 캐시·store에서 함께 제거. */
export function useDeleteParty() {
  const queryClient = useQueryClient()
  const deletePot = usePotStore((s) => s.deletePot)
  return useMutation({
    mutationFn: async (potId: string) => {
      if (!USE_MOCK) await deleteParty(potId)
    },
    onSuccess: (_, potId) => {
      deletePot(potId)
      queryClient.setQueryData<Array<TravelPot>>(
        travelPotKeys.myParties(),
        (pots) => pots?.filter((pot) => pot.id !== potId)
      )
    },
  })
}

/**
 * 내가 속한 팟 목록 — 목/서버 어느 쪽이든 store를 단일 소스로 통일한다.
 *
 * 서버 응답이 오면 store를 덮어쓰므로 화면에서 "목이냐 서버냐"를 다시 고를 필요가 없고,
 * 응답 전이나 실패 시엔 persist된 store 값이 그대로 폴백이 된다.
 */
export function useMyPots(
  currentUserId: string | null,
  options: QueryOptions = {}
) {
  const pots = usePotStore((s) => s.pots)
  const replacePots = usePotStore((s) => s.replacePots)
  const enabled = !USE_MOCK && (options.enabled ?? true)
  const query = useMyParties({ retry: false, ...options, enabled })

  React.useEffect(() => {
    if (query.data) replacePots(query.data)
  }, [query.data, replacePots])

  const myPots = React.useMemo(
    () => getMemberPots(pots, currentUserId),
    [pots, currentUserId]
  )
  const hasFallback = myPots.length > 0

  return {
    pots: myPots,
    hasPot: hasFallback,
    // 보여줄 폴백이 있으면 로딩·에러 상태를 노출하지 않는다
    isPending: enabled && query.isPending && !hasFallback,
    isError: enabled && query.isError && !hasFallback,
  }
}
