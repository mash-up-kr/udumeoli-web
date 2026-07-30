import { create } from "zustand"

import type { Photo } from "./types"

interface PhotoEditState {
  /** 목 모드에서 삭제 처리된 사진 id */
  deletedIds: Array<string>
  /** 목 모드에서 수정된 코멘트 (photoId → comment) */
  comments: Record<string, string>
  markDeleted: (id: string) => void
  setComment: (id: string, comment: string) => void
}

// 목 모드 수정/삭제 반영용 세션 상태 — 시드·업로드 등 출처와 무관하게 목록에 덧씌운다.
// GraphQL 연동 시 서버가 수정/삭제 결과를 내려주므로 이 스토어는 제거 예정.
export const usePhotoEditStore = create<PhotoEditState>((set) => ({
  deletedIds: [],
  comments: {},
  markDeleted: (id) => set((s) => ({ deletedIds: [...s.deletedIds, id] })),
  setComment: (id, comment) =>
    set((s) => ({ comments: { ...s.comments, [id]: comment } })),
}))

/** 삭제·코멘트 수정 반영 — 원본 배열은 변경하지 않는다. */
export function applyPhotoEdits(
  photos: Array<Photo>,
  { deletedIds, comments }: Pick<PhotoEditState, "deletedIds" | "comments">
): Array<Photo> {
  return photos
    .filter((p) => !deletedIds.includes(p.id))
    .map((p) => (p.id in comments ? { ...p, comment: comments[p.id] } : p))
}
