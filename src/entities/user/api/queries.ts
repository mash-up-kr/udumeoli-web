import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchMe, updateProfile } from "./user.api"
import type { QueryOptions } from "@/shared/api/client"

export const userKeys = {
  all: ["user"] as const,
  me: () => [...userKeys.all, "me"] as const,
}

export function useMe(options: QueryOptions = {}) {
  return useQuery({ queryKey: userKeys.me(), queryFn: fetchMe, ...options })
}

/** 닉네임 설정/변경 — 성공 시 me 캐시 갱신. 세션 store 반영은 호출부가 한다. */
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.me() }),
  })
}
