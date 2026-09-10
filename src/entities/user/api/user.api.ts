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
      profileImageUrl
    }
  }
`

const WITHDRAW_MUTATION = /* GraphQL */ `
  mutation Withdraw {
    withdraw
  }
`

const UPDATE_PROFILE_MUTATION = /* GraphQL */ `
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      nickname
      profileImage
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
    // 업로드 이미지면 서버 URL, 프리셋이면 null이라 번호 매핑으로 폴백
    profileImageUrl: dto.profileImageUrl ?? presetAvatarSrc(dto.profileImage),
  }
}

export async function fetchMe(): Promise<User> {
  if (USE_MOCK) return mockResponse(MOCK_USER)

  const data = await gqlClient.request<MeResponse>(ME_QUERY)
  return toUser(data.me)
}

export interface UpdateProfileInput {
  nickname: string
  /**
   * 프리셋 아바타 번호(1~4) 또는 업로드한 사진의 imageId. 미전달 시 서버가 기존 값 유지.
   * 스키마상 ID 타입이라 업로드 imageId는 문자열로 온다.
   */
  profileImage?: number | string
}

export async function updateProfile(input: UpdateProfileInput): Promise<User> {
  if (USE_MOCK)
    return mockResponse({
      ...MOCK_USER,
      nickname: input.nickname,
      ...(input.profileImage != null
        ? // 목에서는 프리셋 번호만 의미가 있다 — 업로드 imageId면 NaN → null 폴백
          { profileImageUrl: presetAvatarSrc(Number(input.profileImage)) }
        : {}),
    })

  const data = await gqlClient.request<UpdateProfileResponse>(
    UPDATE_PROFILE_MUTATION,
    { input }
  )
  return toUser(data.updateProfile)
}

/** 계정 탈퇴 — 서버가 사진·팟 멤버십을 정리한다(정책은 스키마 문서 참고). */
export async function withdrawAccount(): Promise<void> {
  if (USE_MOCK) {
    await mockResponse(null)
    return
  }
  await gqlClient.request(WITHDRAW_MUTATION)
}
