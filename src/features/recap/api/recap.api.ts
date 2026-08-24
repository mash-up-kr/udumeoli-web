import type { RecapStats } from "../lib/stats"

import { gqlClient } from "@/shared/api/client"

const PARTY_TRIP_STATS_QUERY = /* GraphQL */ `
  query PartyTripStats($partyId: ID!) {
    partyTripStats(partyId: $partyId) {
      tripCount
      regionCount
      totalTravelDays
      firstTripDate
      lastTripDate
    }
  }
`

interface PartyTripStatsResponse {
  partyTripStats: {
    tripCount: number
    regionCount: number
    totalTravelDays: number
    firstTripDate: string | null
    lastTripDate: string | null
  }
}

export async function fetchRecapStats(partyId: string): Promise<RecapStats> {
  if (!partyId) throw new Error("리캡 통계를 조회하려면 팟 ID가 필요해요")

  const { partyTripStats } = await gqlClient.request<PartyTripStatsResponse>(
    PARTY_TRIP_STATS_QUERY,
    { partyId }
  )

  return {
    totalDays: partyTripStats.totalTravelDays,
    regionCount: partyTripStats.regionCount,
    pinCount: partyTripStats.tripCount,
  }
}
