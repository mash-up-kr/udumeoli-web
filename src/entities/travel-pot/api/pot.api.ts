import { MOCK_POTS } from "./pot.mock"
import type { PotMember, TravelPot } from "../model/types"
import type { UserDto } from "@/shared/api/client"
import { USE_MOCK, gqlClient, mockResponse } from "@/shared/api/client"
import { presetAvatarSrc } from "@/shared/ui/profile"

const PARTY_FIELDS = /* GraphQL */ `
  fragment PartyFields on Party {
    id
    name
    inviteCode
    createdAt
    owner {
      id
      nickname
      profileImage
      profileImageUrl
    }
    members {
      id
      nickname
      profileImage
      profileImageUrl
    }
  }
`

const MY_PARTIES_QUERY = /* GraphQL */ `
  ${PARTY_FIELDS}
  query MyParties {
    myParties {
      ...PartyFields
    }
  }
`

const CREATE_PARTY_MUTATION = /* GraphQL */ `
  ${PARTY_FIELDS}
  mutation CreateParty($name: String!) {
    createParty(name: $name) {
      ...PartyFields
    }
  }
`

const JOIN_PARTY_MUTATION = /* GraphQL */ `
  ${PARTY_FIELDS}
  mutation JoinParty($inviteCode: String!) {
    joinParty(inviteCode: $inviteCode) {
      ...PartyFields
    }
  }
`

const PARTY_PREVIEW_QUERY = /* GraphQL */ `
  query PartyPreview($inviteCode: String!) {
    partyPreview(inviteCode: $inviteCode) {
      name
      memberCount
      members {
        id
        nickname
        profileImage
        profileImageUrl
      }
    }
  }
`

const LEAVE_PARTY_MUTATION = /* GraphQL */ `
  mutation LeaveParty($partyId: ID!) {
    leaveParty(partyId: $partyId)
  }
`

const DELETE_PARTY_MUTATION = /* GraphQL */ `
  mutation DeleteParty($partyId: ID!) {
    deleteParty(partyId: $partyId)
  }
`

interface PartyDto {
  id: string
  name: string
  inviteCode: string
  createdAt: string
  owner: UserDto
  members: Array<UserDto>
}

interface MyPartiesResponse {
  myParties: Array<PartyDto>
}

interface CreatePartyResponse {
  createParty: PartyDto
}

interface JoinPartyResponse {
  joinParty: PartyDto
}

/** 참여 확정 전 팟 미리보기 — 초대코드는 응답에 없다. */
export interface PotPreview {
  name: string
  memberCount: number
  members: Array<PotMember>
}

interface PartyPreviewResponse {
  partyPreview: { name: string; memberCount: number; members: Array<UserDto> }
}

export type MapCellKeyword =
  | "HEALING"
  | "ACTIVITY"
  | "FOOD"
  | "NATURE"
  | "CITY"
  | "CULTURE"

export interface MapCell {
  regionCode: string
  keyword: MapCellKeyword
  regionCount: number
  visitCount: number
  recordedMemberCount: number
}

export interface PartyMapOverview {
  memberCount: number
  country: MapCell | null
  provinces: Array<MapCell>
  municipalities: Array<MapCell>
}

const PARTY_MAP_OVERVIEW_QUERY = /* GraphQL */ `
  query PartyMapOverview($partyId: ID!) {
    partyMapOverview(partyId: $partyId) {
      memberCount
      country {
        regionCode
        keyword
        regionCount
        visitCount
        recordedMemberCount
      }
      provinces {
        regionCode
        keyword
        regionCount
        visitCount
        recordedMemberCount
      }
      municipalities {
        regionCode
        keyword
        regionCount
        visitCount
        recordedMemberCount
      }
    }
  }
`

interface PartyMapOverviewResponse {
  partyMapOverview: PartyMapOverview
}

function toPotMember(dto: UserDto): PotMember {
  return {
    id: dto.id,
    nickname: dto.nickname,
    // 업로드 이미지면 서버 URL, 프리셋이면 null이라 번호 매핑으로 폴백
    profileImageUrl: dto.profileImageUrl ?? presetAvatarSrc(dto.profileImage),
  }
}

function toTravelPot(dto: PartyDto): TravelPot {
  const owner = toPotMember(dto.owner)
  const members = [
    owner,
    ...dto.members
      .filter((member) => member.id !== owner.id)
      .map((member) => toPotMember(member)),
  ]

  return {
    id: dto.id,
    name: dto.name,
    inviteCode: dto.inviteCode,
    members,
    joinedAt: dto.createdAt,
  }
}

export async function fetchMyParties(): Promise<Array<TravelPot>> {
  if (USE_MOCK) return mockResponse(MOCK_POTS)

  const data = await gqlClient.request<MyPartiesResponse>(MY_PARTIES_QUERY)
  return data.myParties.map((party) => toTravelPot(party))
}

export async function createParty(name: string): Promise<TravelPot> {
  const data = await gqlClient.request<CreatePartyResponse>(
    CREATE_PARTY_MUTATION,
    { name }
  )
  return toTravelPot(data.createParty)
}

export async function joinParty(inviteCode: string): Promise<TravelPot> {
  const data = await gqlClient.request<JoinPartyResponse>(JOIN_PARTY_MUTATION, {
    inviteCode,
  })
  return toTravelPot(data.joinParty)
}

export async function fetchPartyPreview(
  inviteCode: string
): Promise<PotPreview> {
  const data = await gqlClient.request<PartyPreviewResponse>(
    PARTY_PREVIEW_QUERY,
    { inviteCode }
  )
  return {
    name: data.partyPreview.name,
    memberCount: data.partyPreview.memberCount,
    members: data.partyPreview.members.map((member) => toPotMember(member)),
  }
}

export async function fetchPartyMapOverview(
  partyId: string
): Promise<PartyMapOverview> {
  if (USE_MOCK) {
    return mockResponse({
      memberCount: 0,
      country: null,
      provinces: [],
      municipalities: [],
    })
  }
  if (!partyId) {
    throw new Error("지도 집계를 조회하려면 팟 ID가 필요해요")
  }

  const data = await gqlClient.request<PartyMapOverviewResponse>(
    PARTY_MAP_OVERVIEW_QUERY,
    { partyId }
  )
  return data.partyMapOverview
}

/** 팟 나가기 — [정책] owner가 호출하면 OWNER_CANNOT_LEAVE 에러. */
export async function leaveParty(partyId: string): Promise<string> {
  const data = await gqlClient.request<{ leaveParty: string }>(
    LEAVE_PARTY_MUTATION,
    { partyId }
  )
  return data.leaveParty
}

/** 팟 삭제 (owner 전용) — [정책] 다른 멤버가 남아 있으면 PARTY_HAS_MEMBERS 에러. */
export async function deleteParty(partyId: string): Promise<string> {
  const data = await gqlClient.request<{ deleteParty: string }>(
    DELETE_PARTY_MUTATION,
    { partyId }
  )
  return data.deleteParty
}
