import type { PotMember, TravelPot } from "../model/types"

// 영문 소문자+숫자 조합 6자리 랜덤 초대코드
const INVITE_CODE_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789"

export function makeInviteCode(): string {
  return Array.from(
    { length: 6 },
    () =>
      INVITE_CODE_CHARS[Math.floor(Math.random() * INVITE_CODE_CHARS.length)]
  ).join("")
}

function members(names: Array<string>): Array<PotMember> {
  return names.map((nickname, i) => ({
    id: `m-${nickname}-${i}`,
    nickname,
    profileImageUrl: null,
  }))
}

export const MOCK_POTS: Array<TravelPot> = [
  {
    id: "pot-1",
    name: "우두머리",
    inviteCode: "260619",
    members: [
      { id: "user-1", nickname: "정민", profileImageUrl: null },
      { id: "user-2", nickname: "유지", profileImageUrl: null },
      { id: "user-3", nickname: "성아", profileImageUrl: null },
      { id: "user-4", nickname: "가연", profileImageUrl: null },
    ],
  },
  {
    id: "pot-2",
    name: "민지 ❤️ 성준  영원히 함께하자 안녕하세요 민지 성준입니다",
    inviteCode: "26ab19",
    members: members(["민지", "성준"]),
  },
  {
    id: "pot-3",
    name: "매쉬업",
    inviteCode: "260618",
    members: members(["정민", "유지", "성아"]),
  },
]

// 참여 코드 입력 시 확인 모달 미리보기 (러프: 코드와 무관하게 동일 샘플)
export const JOIN_PREVIEW: TravelPot = {
  id: "pot-join-preview",
  name: "강릉 걸스나잇",
  inviteCode: "000000",
  members: members(["정민", "유지", "성아", "가연", "수빈"]),
}

// 러프 목 에러 트리거 코드: 존재하지 않음 / 정원 초과. 참여중 코드는 pots에서 검사.
export const JOIN_ERROR_CODES = {
  notFound: "000000",
  full: "999999",
} as const
