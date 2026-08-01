import { MOCK_USER } from "./user.mock"
import type { User } from "../model/types"
import type { UserDto } from "@/shared/api/client"
import {
  USE_MOCK,
  gqlClient,
  mockResponse,
  toProfileImageUrl,
} from "@/shared/api/client"

const ME_QUERY = /* GraphQL */ `
  query Me {
    me {
      id
      nickname
      profileImageUrl
    }
  }
`

interface MeResponse {
  me: UserDto
}

export function toUser(dto: UserDto): User {
  return {
    id: dto.id,
    nickname: dto.nickname,
    profileImageUrl: toProfileImageUrl(dto.profileImageUrl),
  }
}

export async function fetchMe(): Promise<User> {
  if (USE_MOCK) return mockResponse(MOCK_USER)

  const data = await gqlClient.request<MeResponse>(ME_QUERY)
  return toUser(data.me)
}
