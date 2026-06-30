import { MOCK_PHOTOS } from "./photo.mock"
import type { Photo } from "../model/types"
import { USE_MOCK, mockResponse } from "@/shared/api/client"


export function fetchPhotos(): Promise<Array<Photo>> {
  if (USE_MOCK) return mockResponse(MOCK_PHOTOS)
  // TODO(graphql): return gqlClient.request(PHOTOS_QUERY).then((dto) => dto.photos.map(toPhoto))
  throw new Error("GraphQL photos query not wired yet")
}
