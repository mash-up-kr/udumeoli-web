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

const UPDATE_PROFILE_MUTATION = /* GraphQL */ `
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      nickname
      profileImageUrl
    }
  }
`

interface MeResponse {
  me: UserDto
}

interface UpdateProfileResponse {
  updateProfile: UserDto
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

/**
 * 닉네임 설정/변경 (가입 온보딩 포함) — 프로필 이미지는 로컬 blob URL이라
 * 서버에 보내지 않는다 (미전달 시 서버가 기존 값 유지).
 */
export async function updateProfile(nickname: string): Promise<User> {
  if (USE_MOCK) return mockResponse({ ...MOCK_USER, nickname })

  const data = await gqlClient.request<UpdateProfileResponse>(
    UPDATE_PROFILE_MUTATION,
    { input: { nickname } }
  )
  return toUser(data.updateProfile)
}
