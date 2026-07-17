import { UT_PHOTOS } from "./photo.ut"
import type { Photo } from "../model/types"
import { USE_MOCK, mockResponse } from "@/shared/api/client"

// 신규 유저 기준 빈 상태로 시작 — UT 사진은 시드 트리거로만 주입 (새로고침 시 초기화)
let utSeeded = false

/** UT용 사진 활성화 — 호출 후 photoKeys.list() 쿼리를 invalidate해야 반영된다. */
export function seedUtPhotos() {
  utSeeded = true
}

/** UT 시드 해제(계정 삭제 등) — 신규 유저 기준 빈 사진 목록으로 되돌린다. */
export function resetUtPhotos() {
  utSeeded = false
}

export function fetchPhotos(): Promise<Array<Photo>> {
  if (USE_MOCK) return mockResponse<Array<Photo>>(utSeeded ? UT_PHOTOS : [])
  // TODO(graphql): return gqlClient.request(PHOTOS_QUERY).then((dto) => dto.photos.map(toPhoto))
  throw new Error("GraphQL photos query not wired yet")
}
