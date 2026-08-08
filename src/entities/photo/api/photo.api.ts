import { usePhotoEditStore } from "../model/edit.store"
import { usePhotoUploadStore } from "../model/upload.store"
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

const TRIP_FIELDS = /* GraphQL */ `
  fragment TripFields on Trip {
    id
    regionCode
    keyword
    startDate
    endDate
    records {
      member {
        id
      }
      recorded
      comment
      image {
        id
        originalUrl
        thumbnailUrl
      }
    }
  }
`

const PARTY_TRIPS_QUERY = /* GraphQL */ `
  ${TRIP_FIELDS}
  query PartyTrips($partyId: ID!) {
    partyTrips(partyId: $partyId) {
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

const RECORD_TRIP_MUTATION = /* GraphQL */ `
  ${TRIP_FIELDS}
  mutation RecordTrip($input: RecordTripInput!) {
    recordTrip(input: $input) {
      ...TripFields
    }
  }
`

const DELETE_TRIP_RECORD_MUTATION = /* GraphQL */ `
  mutation DeleteTripRecord($tripId: ID!) {
    deleteTripRecord(tripId: $tripId) {
      id
    }
  }
`

interface TripRecordDto {
  member: { id: string }
  recorded: boolean
  comment: string | null
  image: { id: string; originalUrl: string; thumbnailUrl: string | null } | null
}

interface TripDto {
  id: string
  regionCode: string
  keyword: TravelKeywordId
  startDate: string
  endDate: string
  records: Array<TripRecordDto>
}

interface PartyTripsResponse {
  partyTrips: Array<TripDto>
}

interface CreateImageUploadUrlResponse {
  createImageUploadUrl: { imageId: string; uploadUrl: string }
}

interface CreateTripResponse {
  createTrip: TripDto
}

interface RecordTripResponse {
  recordTrip: TripDto
}

function centerOf(region: string): { lat: number; lng: number } {
  return region in REGION_CENTERS ? REGION_CENTERS[region] : FALLBACK_CENTER
}

/** 서버 Trip 1개 → 기록된 멤버당 Photo 1개로 평면화. */
export function tripToPhotos(dto: TripDto, potId: string): Array<Photo> {
  const region =
    dto.regionCode in REGION_NAME_BY_CODE
      ? REGION_NAME_BY_CODE[dto.regionCode]
      : dto.regionCode
  const center = centerOf(region)
  return dto.records
    .filter(
      (
        record
      ): record is TripRecordDto & {
        image: NonNullable<TripRecordDto["image"]>
      } => record.recorded && record.image !== null
    )
    .map((record) => ({
      id: `${dto.id}:${record.member.id}`,
      tripId: dto.id,
      imageId: record.image.id,
      lat: center.lat,
      lng: center.lng,
      // [정책] 썸네일 생성 전이면 null — 원본으로 대체 표시
      thumbnailUrl: record.image.thumbnailUrl ?? record.image.originalUrl,
      date: dto.startDate,
      uploaderId: record.member.id,
      region,
      potId,
      keyword: dto.keyword,
      ...(record.comment ? { comment: record.comment } : {}),
      ...(dto.endDate !== dto.startDate ? { endDate: dto.endDate } : {}),
    }))
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
    .request<PartyTripsResponse>(PARTY_TRIPS_QUERY, { partyId: potId })
    .then((data) =>
      data.partyTrips.flatMap((trip) => tripToPhotos(trip, potId))
    )
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
  /** 기존 여행(Trip)에 내 기록을 얹는 업로드 — 있으면 recordTrip(upsert), 없으면 createTrip(새 방문) */
  tripId?: string
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

  if (!input.tripId && !input.keyword) {
    // v2 CreateTripInput.keyword는 필수 — 키워드 없는 업로드(팟원 합류)는
    // tripId 분기(recordTrip)로 처리하므로 여기 도달하면 호출부 버그다.
    // 업로드 낭비를 막기 위해 presigned 발급 전에 걸러낸다.
    throw new Error("새 여행 기록에는 키워드가 필요해요")
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

  if (input.tripId) {
    const data = await gqlClient.request<RecordTripResponse>(
      RECORD_TRIP_MUTATION,
      {
        input: {
          tripId: input.tripId,
          image: { imageId, takenAt: input.date },
          ...(input.comment ? { comment: input.comment } : {}),
        },
      }
    )
    const photo = tripToPhotos(data.recordTrip, input.potId).find(
      (p) => p.uploaderId === input.uploaderId
    )
    if (!photo) throw new Error("등록한 기록을 응답에서 찾지 못했어요")
    return photo
  }

  const data = await gqlClient.request<CreateTripResponse>(
    CREATE_TRIP_MUTATION,
    {
      input: {
        partyId: input.potId,
        regionCode,
        keyword: input.keyword,
        startDate: input.date,
        endDate: input.endDate ?? input.date,
        image: { imageId, takenAt: input.date },
        ...(input.comment ? { comment: input.comment } : {}),
      },
    }
  )
  const photo = tripToPhotos(data.createTrip, input.potId).find(
    (p) => p.uploaderId === input.uploaderId
  )
  if (!photo) throw new Error("등록한 기록을 응답에서 찾지 못했어요")
  return photo
}

/**
 * 사진 코멘트 수정 — 실서버는 recordTrip upsert (RecordTripInput.image가 필수라
 * 보존해둔 기존 imageId를 재전송한다). 목 모드는 세션 로컬(edit.store) 유지.
 */
export async function updatePhotoComment(
  photo: Photo,
  comment: string
): Promise<void> {
  if (USE_MOCK || !photo.tripId || !photo.imageId) {
    usePhotoEditStore.getState().setComment(photo.id, comment)
    return
  }
  await gqlClient.request<RecordTripResponse>(RECORD_TRIP_MUTATION, {
    input: {
      tripId: photo.tripId,
      image: { imageId: photo.imageId },
      comment,
    },
  })
}

/**
 * 내 기록 삭제 — 실서버는 deleteTripRecord (마지막 기록이면 여행 자체가 사라지고
 * null 응답). 목 모드는 edit.store에 기록해 출처와 무관하게 목록에서 제외한다.
 */
export function deletePhoto(photo: Photo): Promise<void> {
  if (USE_MOCK || !photo.tripId) {
    usePhotoEditStore.getState().markDeleted(photo.id)
    return mockResponse(undefined)
  }
  return gqlClient
    .request<{
      deleteTripRecord: { id: string } | null
    }>(DELETE_TRIP_RECORD_MUTATION, { tripId: photo.tripId })
    .then(() => undefined)
}
