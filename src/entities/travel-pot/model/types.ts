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
  /** 사용자가 이 팟에 입장한 시점. YYYY / YYYY-MM / YYYY-MM-DD 중 사용 가능. */
  joinedAt?: string
  /** 탈퇴/계정 삭제로 비워진 자리 수. 팟 자체는 유지한다. */
  vacantSlots?: number
}

/** 초대코드 확인 결과 — 실패 사유별 에러 처리(토스트)는 호출부 담당. */
export type JoinPreviewResult =
  | { status: "ok"; pot: TravelPot }
  | { status: "not_found" | "already_joined" | "full" }
