import { MOCK_USER } from "./user.mock"
import type { User } from "../model/types"
import type { UserDto } from "@/shared/api/client"
import { USE_MOCK, gqlClient, mockResponse } from "@/shared/api/client"
import { presetAvatarSrc } from "@/shared/ui/profile"

const ME_QUERY = /* GraphQL */ `
  query Me {
    me {
      id
      nickname
      profileImage
    }
  }
`

const UPDATE_PROFILE_MUTATION = /* GraphQL */ `
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      nickname
      profileImage
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
    profileImageUrl: presetAvatarSrc(dto.profileImage),
  }
}

export async function fetchMe(): Promise<User> {
  if (USE_MOCK) return mockResponse(MOCK_USER)

  const data = await gqlClient.request<MeResponse>(ME_QUERY)
  return toUser(data.me)
}

export interface UpdateProfileInput {
  nickname: string
  /** 프리셋 아바타 번호(1부터). 미전달 시 서버가 기존 값 유지 — 커스텀 blob은 전송 불가. */
  profileImage?: number
}

export async function updateProfile(input: UpdateProfileInput): Promise<User> {
  if (USE_MOCK)
    return mockResponse({
      ...MOCK_USER,
      nickname: input.nickname,
      ...(input.profileImage != null
        ? { profileImageUrl: presetAvatarSrc(input.profileImage) }
        : {}),
    })

  const data = await gqlClient.request<UpdateProfileResponse>(
    UPDATE_PROFILE_MUTATION,
    { input }
  )
  return toUser(data.updateProfile)
}
