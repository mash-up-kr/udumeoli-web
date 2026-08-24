import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { applyPhotoEdits, usePhotoEditStore } from "../model/edit.store"
import { usePhotoUploadStore } from "../model/upload.store"
import {
  createPhoto,
  deletePhoto,
  fetchPhotos,
  updatePhotoComment,
} from "./photo.api"
import type { Photo } from "../model/types"

export const photoKeys = {
  all: ["photo"] as const,
  list: (potId: string) => [...photoKeys.all, "list", potId] as const,
}

export function usePhotos(potId: string) {
  return useQuery({
    queryKey: photoKeys.list(potId),
    queryFn: () => fetchPhotos(potId),
  })
}

// 서버(목) 사진 + 세션 업로드 사진 병합 — 현재 팟 소속 사진만, 수정/삭제 반영
export function useAllPhotos(potId: string) {
  const { data = [] } = usePhotos(potId)
  const uploaded = usePhotoUploadStore((s) => s.uploaded)
  const deletedIds = usePhotoEditStore((s) => s.deletedIds)
  const comments = usePhotoEditStore((s) => s.comments)
  return React.useMemo(
    () =>
      applyPhotoEdits(
        [...data, ...uploaded].filter((p) => p.potId === potId),
        { deletedIds, comments }
      ),
    [data, uploaded, potId, deletedIds, comments]
  )
}

/**
 * 여행 앨범 지역 상세용 사진 목록 — 전체 사진에서 해당 지역만.
 * 앨범 목 시드는 fetchPhotos(목)에서 병합되므로 여기선 필터만 한다.
 */
export function useRegionAlbumPhotos(potId: string, region: string) {
  const all = useAllPhotos(potId)
  return React.useMemo(
    () => all.filter((p) => p.region === region),
    [all, region]
  )
}

/** 사진(여행) 등록 — 성공 시 해당 팟 사진 목록 갱신. */
export function useCreatePhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPhoto,
    onSuccess: (photo) => {
      queryClient.invalidateQueries({ queryKey: photoKeys.list(photo.potId) })
      queryClient.invalidateQueries({
        queryKey: ["travel-pot", "map-overview", photo.potId],
      })
    },
  })
}

/** 사진 코멘트 수정 — 성공 시 사진 목록 갱신. (수정 화면 연결 시 사용) */
export function useUpdatePhotoComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ photo, comment }: { photo: Photo; comment: string }) =>
      updatePhotoComment(photo, comment),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: photoKeys.all }),
  })
}

/** 사진 삭제 — 성공 시 사진 목록 갱신. */
export function useDeletePhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (photo: Photo) => deletePhoto(photo),
    onSuccess: (_, photo) => {
      queryClient.invalidateQueries({ queryKey: photoKeys.all })
      queryClient.invalidateQueries({
        queryKey: ["travel-pot", "map-overview", photo.potId],
      })
    },
  })
}
