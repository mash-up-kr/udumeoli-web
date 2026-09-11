import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { applyPhotoEdits, usePhotoEditStore } from "../model/edit.store"
import { usePhotoUploadStore } from "../model/upload.store"
import { createPhoto, deletePhoto, fetchPhotos } from "./photo.api"
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

// 서버(목) 사진 + 세션 업로드 사진 병합 — 현재 팟 소속 사진만, 삭제 반영
export function useAllPhotos(potId: string) {
  const { data = [] } = usePhotos(potId)
  const uploaded = usePhotoUploadStore((s) => s.uploaded)
  const deletedIds = usePhotoEditStore((s) => s.deletedIds)
  return React.useMemo(
    () =>
      applyPhotoEdits(
        [...data, ...uploaded].filter((p) => p.potId === potId),
        { deletedIds }
      ),
    [data, uploaded, potId, deletedIds]
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

interface PendingPhotoDelete {
  pending: number
  succeeded: boolean
  previousPhotos: Array<Photo> | undefined
}

const pendingPhotoDeletes = new Map<string, PendingPhotoDelete>()

function photoDeleteKey(photo: Photo) {
  return `${photo.potId}:${photo.id}`
}

/** 사진 삭제 — 요청 즉시 목록에서 숨기고, 실패하면 이전 상태로 복구한다. */
export function useDeletePhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (photo: Photo) => deletePhoto(photo),
    onMutate: async (photo) => {
      const queryKey = photoKeys.list(photo.potId)
      const previousPhotos = queryClient.getQueryData<Array<Photo>>(queryKey)
      const key = photoDeleteKey(photo)
      const pendingDelete = pendingPhotoDeletes.get(key)
      if (pendingDelete) {
        pendingDelete.pending += 1
      } else {
        pendingPhotoDeletes.set(key, {
          pending: 1,
          succeeded: false,
          previousPhotos,
        })
      }

      usePhotoEditStore.getState().markDeleted(photo.id)
      queryClient.setQueryData<Array<Photo> | undefined>(queryKey, (photos) =>
        photos?.filter((item) => item.id !== photo.id)
      )

      // Optimistic state is applied before cancellation so the UI does not wait for an in-flight fetch.
      try {
        await queryClient.cancelQueries({ queryKey })
      } catch {
        // A cancellation failure must not prevent the delete request or its rollback context.
      }

      return { key }
    },
    onError: (_, photo, context) => {
      if (!context?.key) return
      const pendingDelete = pendingPhotoDeletes.get(context.key)
      if (!pendingDelete) return

      pendingDelete.pending -= 1
      if (pendingDelete.pending > 0) return

      if (!pendingDelete.succeeded) {
        usePhotoEditStore.getState().restoreDeleted(photo.id)
        const deletedPhoto = pendingDelete.previousPhotos?.find(
          (item) => item.id === photo.id
        )
        if (deletedPhoto) {
          queryClient.setQueryData<Array<Photo>>(
            photoKeys.list(photo.potId),
            (photos) => {
              if (!photos || photos.some((item) => item.id === photo.id)) {
                return photos
              }
              return [...photos, deletedPhoto]
            }
          )
        }
      }
      pendingPhotoDeletes.delete(context.key)
    },
    onSuccess: (_, photo) => {
      const key = photoDeleteKey(photo)
      const pendingDelete = pendingPhotoDeletes.get(key)
      if (pendingDelete) {
        pendingDelete.succeeded = true
        pendingDelete.pending -= 1
        if (pendingDelete.pending === 0) pendingPhotoDeletes.delete(key)
      }
      queryClient.invalidateQueries({
        queryKey: ["travel-pot", "map-overview", photo.potId],
      })
    },
    onSettled: (_, __, photo) => {
      void queryClient.invalidateQueries({
        queryKey: photoKeys.list(photo.potId),
      })
    },
  })
}
