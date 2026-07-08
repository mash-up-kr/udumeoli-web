export interface PotMember {
  id: string
  nickname: string
  profileImageUrl: string | null
}

export interface TravelPot {
  id: string
  name: string
  inviteCode: string
  members: Array<PotMember>
}

/** 초대코드 확인 결과 — 실패 사유별 에러 처리(토스트)는 호출부 담당. */
export type JoinPreviewResult =
  | { status: "ok"; pot: TravelPot }
  | { status: "not_found" | "already_joined" | "full" }
