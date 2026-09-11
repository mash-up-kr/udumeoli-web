import { create } from "zustand"

import type { Photo } from "./types"

interface PhotoEditState {
  /** 목 모드에서 삭제 처리된 사진 id */
  deletedIds: Array<string>
  markDeleted: (id: string) => void
  restoreDeleted: (id: string) => void
}

// 목 모드 삭제 반영용 세션 상태 — 시드·업로드 등 출처와 무관하게 목록에서 제외한다.
// 코멘트는 기록 플로우가 기록을 통째로 교체하는 방식이라 여기서 덧씌우지 않는다.
// GraphQL 연동 시 서버가 삭제 결과를 내려주므로 이 스토어는 제거 예정.
export const usePhotoEditStore = create<PhotoEditState>((set) => ({
  deletedIds: [],
  markDeleted: (id) =>
    set((s) =>
      s.deletedIds.includes(id) ? s : { deletedIds: [...s.deletedIds, id] }
    ),
  restoreDeleted: (id) =>
    set((s) => ({
      deletedIds: s.deletedIds.filter((deletedId) => deletedId !== id),
    })),
}))

/** 삭제 반영 — 원본 배열은 변경하지 않는다. */
export function applyPhotoEdits(
  photos: Array<Photo>,
  { deletedIds }: Pick<PhotoEditState, "deletedIds">
): Array<Photo> {
  return photos.filter((p) => !deletedIds.includes(p.id))
}
