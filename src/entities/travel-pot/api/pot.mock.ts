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
    joinedAt: `2026-06-${String(i + 1).padStart(2, "0")}`,
  })
)

// 신규 가입(목) 첫 진입 데모용 5인 팟 — photo.mock STICKER_DEMO_PHOTOS(전국 100개
// 지역 스티커 시드)가 이 팟에 매인다. 가입 완료 시 SignupPage가 store에 주입·선택한다.
export const TRIP_100_POT: TravelPot = {
  id: "pot-trip-100-1",
  name: "여행 100번",
  inviteCode: "260715",
  members: [ME, ...OTHERS.slice(0, 4)],
  joinedAt: "2026-07-15",
}

// 여행 앨범 목데이터 전용 4인 팟 — photo.mock ALBUM_PHOTOS의 uploaderId
// (user-1, m-유지-0, m-성아-1, m-가연-2)와 일치해야 앨범/지도 슬롯에 매칭된다.
// 온보딩을 마친(팟 보유) 유저에게 pot.store가 자동 주입한다.
export const ALBUM_POT: TravelPot = {
  id: "pot-album-1",
  name: "우두머리",
  inviteCode: "260620",
  members: [ME, ...members(["유지", "성아", "가연"])],
  joinedAt: "2026-06-20",
}

// 1차 UT 시드용 팟 3개 — 각 팟은 나(user-1) 포함 4인.
// 사진 시드(photo.ut)의 potId·uploaderId(UT_POT_OTHERS)와 일치해야 함
export const UT_POTS: Array<TravelPot> = [
  {
    id: "pot-ut-1",
    name: "딸깍",
    inviteCode: "260611",
    members: [ME, ...members(["축구왕 준표", "존잘 창우", "사진작가 정우"])],
    joinedAt: "2026-08",
  },
  {
    id: "pot-ut-2",
    name: "해피하우스",
    inviteCode: "260612",
    members: [ME, ...members(["권예인", "김나희", "이원영"])],
    joinedAt: "2026-07",
  },
  {
    id: "pot-ut-3",
    name: "팀장은 연경이",
    inviteCode: "260613",
    members: [ME, ...members(["김수연", "장서휘", "전계원"])],
    joinedAt: "2025",
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
