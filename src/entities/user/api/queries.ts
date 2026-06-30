import { useQuery } from "@tanstack/react-query"

import { fetchMe } from "./user.api"

export const userKeys = {
  all: ["user"] as const,
  me: () => [...userKeys.all, "me"] as const,
}

export function useMe() {
  return useQuery({ queryKey: userKeys.me(), queryFn: fetchMe })
}
