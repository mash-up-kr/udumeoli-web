import * as React from "react"
import { useQuery } from "@tanstack/react-query"

import { usePhotoUploadStore } from "../model/upload.store"
import { fetchPhotos } from "./photo.api"

export const photoKeys = {
  all: ["photo"] as const,
  list: () => [...photoKeys.all, "list"] as const,
}

export function usePhotos() {
  return useQuery({ queryKey: photoKeys.list(), queryFn: fetchPhotos })
}

// 서버(목) 사진 + 세션 업로드 사진 병합
export function useAllPhotos() {
  const { data = [] } = usePhotos()
  const uploaded = usePhotoUploadStore((s) => s.uploaded)
  return React.useMemo(() => [...data, ...uploaded], [data, uploaded])
}
