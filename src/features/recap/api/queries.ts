import { useQuery } from "@tanstack/react-query"

import { fetchRecapStats } from "./recap.api"
import { USE_MOCK } from "@/shared/api/client"

export const recapKeys = {
  all: ["recap"] as const,
  stats: (partyId: string) => [...recapKeys.all, "stats", partyId] as const,
}

export function useRecapStats(partyId: string) {
  return useQuery({
    queryKey: recapKeys.stats(partyId),
    queryFn: () => fetchRecapStats(partyId),
    enabled: Boolean(partyId) && !USE_MOCK,
  })
}
