import { useQuery } from "@tanstack/react-query"

import { fetchPhotos } from "./photo.api"

export const photoKeys = {
  all: ["photo"] as const,
  list: () => [...photoKeys.all, "list"] as const,
}

export function usePhotos() {
  return useQuery({ queryKey: photoKeys.list(), queryFn: fetchPhotos })
}
