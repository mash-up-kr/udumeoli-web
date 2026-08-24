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
