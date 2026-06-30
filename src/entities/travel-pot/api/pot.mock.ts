import type { PotMember, TravelPot } from "../model/types"

export function makeInviteCode(): string {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join("")
}

function members(names: Array<string>): Array<PotMember> {
  return names.map((nickname, i) => ({
    id: `m-${nickname}-${i}`,
    nickname,
    profileImageUrl: null,
  }))
}

export const MOCK_POTS: Array<TravelPot> = [
  { id: "pot-1", name: "우두머리", inviteCode: "260619", members: members(["정민", "유저"]) },
  { id: "pot-2", name: "강릉 여행팟", inviteCode: "260618", members: members(["정민", "유지", "성아"]) },
]

// 참여 코드 입력 시 확인 모달 미리보기 (러프: 코드와 무관하게 동일 샘플)
export const JOIN_PREVIEW: TravelPot = {
  id: "pot-join-preview",
  name: "강릉 걸스나잇",
  inviteCode: "000000",
  members: members(["정민", "유지", "성아", "가연", "수빈"]),
}
