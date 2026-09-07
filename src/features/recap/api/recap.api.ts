import type { RecapStats } from "../lib/stats"

import { gqlClient } from "@/shared/api/client"

const PARTY_TRIP_STATS_QUERY = /* GraphQL */ `
  query PartyTripStats($partyId: ID!) {
    partyTripStats(partyId: $partyId) {
      regionCount
    }
  }
`

interface PartyTripStatsResponse {
  partyTripStats: {
    regionCount: number
  }
}

export async function fetchRecapStats(partyId: string): Promise<RecapStats> {
  if (!partyId) throw new Error("리캡 통계를 조회하려면 팟 ID가 필요해요")

  const { partyTripStats } = await gqlClient.request<PartyTripStatsResponse>(
    PARTY_TRIP_STATS_QUERY,
    { partyId }
  )

  // 핀은 지역마다 하나라 "N개의 핀"과 "다녀온 지역 수"가 같은 값이다 (서버 TripStats 주석)
  return {
    regionCount: partyTripStats.regionCount,
    pinCount: partyTripStats.regionCount,
  }
}
