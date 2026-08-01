import { MOCK_POTS } from "./pot.mock"
import type { PotMember, TravelPot } from "../model/types"
import type { UserDto } from "@/shared/api/client"
import {
  USE_MOCK,
  gqlClient,
  mockResponse,
  toProfileImageUrl,
} from "@/shared/api/client"

const PARTY_FIELDS = /* GraphQL */ `
  fragment PartyFields on Party {
    id
    name
    inviteCode
    createdAt
    owner {
      id
      nickname
      profileImageUrl
    }
    members {
      id
      nickname
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

function toPotMember(dto: UserDto): PotMember {
  return {
    id: dto.id,
    nickname: dto.nickname,
    profileImageUrl: toProfileImageUrl(dto.profileImageUrl),
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
