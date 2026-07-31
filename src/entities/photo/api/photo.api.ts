import { usePhotoEditStore } from "../model/edit.store"
import { UT_PHOTOS } from "./photo.ut"
import type { Photo } from "../model/types"
import { USE_MOCK, mockResponse } from "@/shared/api/client"

// 신규 유저 기준 빈 상태로 시작 — UT 사진은 시드 트리거로만 주입 (새로고침 시 초기화)
let utSeeded = false
let removedSeedUploaderIds = new Set<string>()

/** UT용 사진 활성화 — 호출 후 photoKeys.list() 쿼리를 invalidate해야 반영된다. */
export function seedUtPhotos() {
  utSeeded = true
}

/** UT 시드 해제(계정 삭제 등) — 신규 유저 기준 빈 사진 목록으로 되돌린다. */
export function resetUtPhotos() {
  utSeeded = false
  removedSeedUploaderIds = new Set()
}

/** UT 시드 사진 중 계정 삭제된 업로더의 사진만 목록에서 제외한다. */
export function removeSeedPhotosByUploader(uploaderId: string) {
  removedSeedUploaderIds.add(uploaderId)
}

export function fetchPhotos(): Promise<Array<Photo>> {
  if (USE_MOCK) {
    const photos = utSeeded
      ? UT_PHOTOS.filter(
          (photo) => !removedSeedUploaderIds.has(photo.uploaderId)
        )
      : []
    return mockResponse<Array<Photo>>(photos)
  }
  // TODO(graphql): return gqlClient.request(PHOTOS_QUERY).then((dto) => dto.photos.map(toPhoto))
  throw new Error("GraphQL photos query not wired yet")
}

/** 사진 코멘트 수정 — 목 모드는 edit.store에 기록해 목록 훅이 즉시 반영한다. */
export function updatePhotoComment(id: string, comment: string): Promise<void> {
  if (USE_MOCK) {
    usePhotoEditStore.getState().setComment(id, comment)
    return mockResponse(undefined)
  }
  // TODO(graphql): return gqlClient.request(UPDATE_PHOTO_MUTATION, { id, comment })
  throw new Error("GraphQL updatePhoto mutation not wired yet")
}

/** 사진 삭제 — 목 모드는 edit.store에 기록해 시드·업로드 출처와 무관하게 목록에서 제외한다. */
export function deletePhoto(id: string): Promise<void> {
  if (USE_MOCK) {
    usePhotoEditStore.getState().markDeleted(id)
    return mockResponse(undefined)
  }
  // TODO(graphql): return gqlClient.request(DELETE_PHOTO_MUTATION, { id })
  throw new Error("GraphQL deletePhoto mutation not wired yet")
}
