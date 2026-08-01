import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { applyPhotoEdits, usePhotoEditStore } from "../model/edit.store"
import { usePhotoUploadStore } from "../model/upload.store"
import { deletePhoto, fetchPhotos, updatePhotoComment } from "./photo.api"

export const photoKeys = {
  all: ["photo"] as const,
  list: () => [...photoKeys.all, "list"] as const,
}

export function usePhotos() {
  return useQuery({ queryKey: photoKeys.list(), queryFn: fetchPhotos })
}

// 서버(목) 사진 + 세션 업로드 사진 병합 — 현재 팟 소속 사진만, 수정/삭제 반영
export function useAllPhotos(potId: string) {
  const { data = [] } = usePhotos()
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

/** 사진 코멘트 수정 — 성공 시 사진 목록 갱신. (수정 화면 연결 시 사용) */
export function useUpdatePhotoComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      updatePhotoComment(id, comment),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: photoKeys.list() }),
  })
}

/** 사진 삭제 — 성공 시 사진 목록 갱신. */
export function useDeletePhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePhoto(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: photoKeys.list() }),
  })
}
