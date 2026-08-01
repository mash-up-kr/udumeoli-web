import { useQuery } from "@tanstack/react-query"

import { fetchMe } from "./user.api"
import type { QueryOptions } from "@/shared/api/client"

export const userKeys = {
  all: ["user"] as const,
  me: () => [...userKeys.all, "me"] as const,
}

export function useMe(options: QueryOptions = {}) {
  return useQuery({ queryKey: userKeys.me(), queryFn: fetchMe, ...options })
}
