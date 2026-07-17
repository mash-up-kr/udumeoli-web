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

// 인원수별(1~6명) 슬롯 배치 케이스 확인용 예시 팟 — "나"(user-1)는 모든 팟에 포함
const ME: PotMember = { id: "user-1", nickname: "정민", profileImageUrl: null }
const OTHERS = members(["유지", "성아", "가연", "수빈", "민지"])

export const MOCK_POTS: Array<TravelPot> = Array.from(
  { length: 6 },
  (_, i) => ({
    id: `pot-${i + 1}`,
    name: `${i + 1}명 팟`,
    inviteCode: `26061${i}`,
    members: [ME, ...OTHERS.slice(0, i)],
  })
)

// 1차 UT 시드용 팟 3개 — 각 팟은 나(user-1) 포함 4인.
// 사진 시드(photo.ut)의 potId·uploaderId(UT_POT_OTHERS)와 일치해야 함
export const UT_POTS: Array<TravelPot> = [
  {
    id: "pot-ut-1",
    name: "딸깍",
    inviteCode: "260611",
    members: [ME, ...members(["축구왕 준표", "존잘 창우", "사진작가 정우"])],
  },
  {
    id: "pot-ut-2",
    name: "해피하우스",
    inviteCode: "260612",
    members: [ME, ...members(["권예인", "김나희", "이원영"])],
  },
  {
    id: "pot-ut-3",
    name: "팀장은 연경이",
    inviteCode: "260613",
    members: [ME, ...members(["김수연", "장서휘", "전계원"])],
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
