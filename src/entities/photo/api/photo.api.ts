import { usePhotoEditStore } from "../model/edit.store"
import { usePhotoUploadStore } from "../model/upload.store"
import { TRAVEL_KEYWORDS, findKeyword } from "../model/keywords"
import { REGION_CENTERS } from "../model/regions"
import { ALBUM_PHOTOS, STICKER_DEMO_PHOTOS } from "./photo.mock"
import { UT_PHOTOS } from "./photo.ut"
import type { TravelKeywordId } from "../model/keywords"
import type { Photo } from "../model/types"
import { USE_MOCK, gqlClient, mockResponse } from "@/shared/api/client"
import {
  REGION_CODE_BY_NAME,
  REGION_NAME_BY_CODE,
} from "@/shared/api/region-codes"

// 서버 사진(Trip)에는 좌표가 없다 — 지도는 지역명 기준 centroid로 그리므로
// 대표 좌표 폴백만 있으면 된다 (REGION_CENTERS에 없는 지역은 전국 중심 근처)
const FALLBACK_CENTER = { lat: 36.2, lng: 127.8 }

// 키워드 없이 등록되는 사진(팟원 합류 업로드 폴백)의 서버 색상 —
// 키워드 fill과 겹치지 않는 중립색이라 다시 내려받아도 키워드 없음으로 복원된다
const DEFAULT_TRIP_COLOR = "#9eb8ac"

const TRIP_FIELDS = /* GraphQL */ `
  fragment TripFields on Trip {
    id
    region {
      code
      name
    }
    color
    startDate
    endDate
    images {
      id
      originalUrl
      thumbnailUrl
    }
    createdBy {
      id
    }
  }
`

const TRIPS_QUERY = /* GraphQL */ `
  ${TRIP_FIELDS}
  query Trips($partyId: ID!) {
    trips(partyId: $partyId) {
      ...TripFields
    }
  }
`

const CREATE_IMAGE_UPLOAD_URL_MUTATION = /* GraphQL */ `
  mutation CreateImageUploadUrl($input: CreateImageUploadUrlInput!) {
    createImageUploadUrl(input: $input) {
      imageId
      uploadUrl
    }
  }
`

const CREATE_TRIP_MUTATION = /* GraphQL */ `
  ${TRIP_FIELDS}
  mutation CreateTrip($input: CreateTripInput!) {
    createTrip(input: $input) {
      ...TripFields
    }
  }
`

const DELETE_TRIP_MUTATION = /* GraphQL */ `
  mutation DeleteTrip($tripId: ID!) {
    deleteTrip(tripId: $tripId)
  }
`

interface TripDto {
  id: string
  region: { code: string; name: string }
  color: string
  startDate: string
  endDate: string
  images: Array<{
    id: string
    originalUrl: string
    thumbnailUrl: string | null
  }>
  createdBy: { id: string } | null
}

interface TripsResponse {
  trips: Array<TripDto>
}

interface CreateImageUploadUrlResponse {
  createImageUploadUrl: { imageId: string; uploadUrl: string }
}

interface CreateTripResponse {
  createTrip: TripDto
}

function centerOf(region: string): { lat: number; lng: number } {
  return region in REGION_CENTERS ? REGION_CENTERS[region] : FALLBACK_CENTER
}

/** 서버 Trip → 앱 Photo. 키워드는 색상 역매핑(키워드마다 fill이 유일)으로 복원한다. */
function toPhoto(dto: TripDto, potId: string): Photo {
  const region =
    dto.region.code in REGION_NAME_BY_CODE
      ? REGION_NAME_BY_CODE[dto.region.code]
      : dto.region.name
  const image = dto.images.at(0)
  const center = centerOf(region)
  const keyword = TRAVEL_KEYWORDS.find((k) => k.fill === dto.color)
  return {
    id: dto.id,
    lat: center.lat,
    lng: center.lng,
    // [정책] 썸네일 생성 전이면 null — 원본으로 대체 표시
    thumbnailUrl: image?.thumbnailUrl ?? image?.originalUrl ?? "",
    date: dto.startDate,
    uploaderId: dto.createdBy?.id ?? "",
    region,
    potId,
    ...(keyword ? { keyword: keyword.id } : {}),
    ...(dto.endDate !== dto.startDate ? { endDate: dto.endDate } : {}),
  }
}

// UT 사진은 시드 트리거로만 주입 (새로고침 시 초기화). 앨범·스티커 데모 목 사진은
// 항상 포함 — 각자 전용 팟(ALBUM_POT_ID/TRIP_100_POT_ID) 소속이라
// 신규 유저(팟 없음)의 빈 상태에는 영향이 없다.
let utSeeded = false
let removedSeedUploaderIds = new Set<string>()

/** UT용 사진 활성화 — 호출 후 photoKeys 쿼리를 invalidate해야 반영된다. */
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

export function fetchPhotos(potId: string): Promise<Array<Photo>> {
  if (USE_MOCK) {
    const photos = [
      ...ALBUM_PHOTOS,
      ...STICKER_DEMO_PHOTOS,
      ...(utSeeded ? UT_PHOTOS : []),
    ].filter((photo) => !removedSeedUploaderIds.has(photo.uploaderId))
    return mockResponse<Array<Photo>>(photos)
  }
  if (!potId) return Promise.resolve([])
  return gqlClient
    .request<TripsResponse>(TRIPS_QUERY, { partyId: potId })
    .then((data) => data.trips.map((trip) => toPhoto(trip, potId)))
}

export interface CreatePhotoInput {
  potId: string
  region: string
  date: string
  /** 기간 여행 종료일 — 없으면 당일 여행 */
  endDate?: string
  keyword?: TravelKeywordId
  comment?: string
  uploaderId: string
  /** 업로드할 원본 파일 */
  file: File
  /** 미리보기 blob URL — 목 모드 사진의 thumbnailUrl로 사용 */
  previewUrl: string
  /** 사진 등록 좌표 — 없으면 지역 대표 좌표 (목 모드 전용, 서버는 좌표를 받지 않는다) */
  center?: { lat: number; lng: number }
}

/**
 * 사진(여행) 등록 — 목 모드는 세션 업로드 store에 기록,
 * 실서버는 presigned URL 발급 → 원본 PUT → createTrip 순서로 등록한다.
 */
export async function createPhoto(input: CreatePhotoInput): Promise<Photo> {
  if (USE_MOCK) {
    const center = input.center ?? centerOf(input.region)
    const photo: Photo = {
      id: `up-${input.region}-${Date.now()}`,
      region: input.region,
      date: input.date,
      lat: center.lat,
      lng: center.lng,
      thumbnailUrl: input.previewUrl,
      uploaderId: input.uploaderId,
      potId: input.potId,
      ...(input.endDate && input.endDate !== input.date
        ? { endDate: input.endDate }
        : {}),
      ...(input.keyword ? { keyword: input.keyword } : {}),
      ...(input.comment ? { comment: input.comment } : {}),
    }
    usePhotoUploadStore.getState().addPhoto(photo)
    return mockResponse(photo)
  }

  if (!(input.region in REGION_CODE_BY_NAME)) {
    throw new Error(`알 수 없는 지역: ${input.region}`)
  }
  const regionCode = REGION_CODE_BY_NAME[input.region]
  const contentType = input.file.type || "image/jpeg"

  const target = await gqlClient.request<CreateImageUploadUrlResponse>(
    CREATE_IMAGE_UPLOAD_URL_MUTATION,
    { input: { contentType } }
  )
  const { imageId, uploadUrl } = target.createImageUploadUrl

  // presigned URL은 발급 시 서명된 content-type 헤더를 그대로 요구한다
  const uploaded = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: input.file,
  })
  if (!uploaded.ok) {
    throw new Error(`이미지 업로드 실패 (${uploaded.status})`)
  }

  const data = await gqlClient.request<CreateTripResponse>(
    CREATE_TRIP_MUTATION,
    {
      input: {
        partyId: input.potId,
        regionCode,
        color: findKeyword(input.keyword)?.fill ?? DEFAULT_TRIP_COLOR,
        startDate: input.date,
        endDate: input.endDate ?? input.date,
        imageIds: [imageId],
      },
    }
  )
  const photo = toPhoto(data.createTrip, input.potId)

  // TODO(graphql): 서버 Trip에 comment 필드가 없어 세션 로컬(edit.store)로만 유지
  if (input.comment) {
    usePhotoEditStore.getState().setComment(photo.id, input.comment)
    return { ...photo, comment: input.comment }
  }
  return photo
}

/**
 * 사진 코멘트 수정 — 서버 Trip에 comment 필드가 없어 목·실서버 모두
 * 세션 로컬(edit.store)에 기록해 목록 훅이 즉시 반영한다.
 * TODO(graphql): 서버에 comment 필드가 생기면 updateTrip으로 이전
 */
export function updatePhotoComment(id: string, comment: string): Promise<void> {
  usePhotoEditStore.getState().setComment(id, comment)
  return Promise.resolve()
}

/** 사진 삭제 — 목 모드는 edit.store에 기록해 시드·업로드 출처와 무관하게 목록에서 제외한다. */
export function deletePhoto(id: string): Promise<void> {
  if (USE_MOCK) {
    usePhotoEditStore.getState().markDeleted(id)
    return mockResponse(undefined)
  }
  return gqlClient
    .request<{ deleteTrip: string }>(DELETE_TRIP_MUTATION, { tripId: id })
    .then(() => undefined)
}
