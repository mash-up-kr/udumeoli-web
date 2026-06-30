import { MOCK_USER } from "./user.mock"
import type { User } from "../model/types"
import { USE_MOCK, mockResponse } from "@/shared/api/client"


export function fetchMe(): Promise<User> {
  if (USE_MOCK) return mockResponse(MOCK_USER)
  // TODO(graphql): return gqlClient.request(ME_QUERY).then(dto => toUser(dto))
  throw new Error("GraphQL ME query not wired yet")
}
