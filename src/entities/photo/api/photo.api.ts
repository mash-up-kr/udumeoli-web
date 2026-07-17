import type { Photo } from "../model/types"
import { USE_MOCK, mockResponse } from "@/shared/api/client"

export function fetchPhotos(): Promise<Array<Photo>> {
  // 신규 유저 기준 빈 상태로 시작 — 목 사진은 UT 데이터 시드로만 주입
  if (USE_MOCK) return mockResponse<Array<Photo>>([])
  // TODO(graphql): return gqlClient.request(PHOTOS_QUERY).then((dto) => dto.photos.map(toPhoto))
  throw new Error("GraphQL photos query not wired yet")
}
