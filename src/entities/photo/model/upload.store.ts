import { create } from "zustand"

import type { Photo } from "./types"

interface UploadState {
  uploaded: Array<Photo>
  addPhoto: (photo: Photo) => void
  /** 계정 삭제 시 해당 유저가 업로드한 사진 전부 제거. */
  removePhotosByUploader: (uploaderId: string) => void
}

// 세션 내 업로드한 사진(러프). 추후 GraphQL mutation으로 교체.
export const usePhotoUploadStore = create<UploadState>((set) => ({
  uploaded: [],
  addPhoto: (photo) => set((s) => ({ uploaded: [...s.uploaded, photo] })),
  removePhotosByUploader: (uploaderId) =>
    set((s) => ({
      uploaded: s.uploaded.filter((p) => p.uploaderId !== uploaderId),
    })),
}))
