/**
 * Google Maps 이식 스파이크 (#76) — MapLibre 구현(widgets/travel-map)의 전체 기능 포팅.
 *
 * 확정 아님, PoC 검증용. 알려진 gap (자세한 내용은 루트 GOOGLE_MAPS_SPEC.md):
 * - flyTo/fitBounds 애니메이션: Google panTo/fitBounds는 duration 옵션이 없어 즉시 이동
 * - 배경 타일: MapTiler 파스텔 스타일 재현 불가, Google 기본 스타일 그대로 사용
 * - AdvancedMarker는 mapId(Cloud Console 발급 또는 DEMO_MAP_ID)가 필요
 */
import * as React from "react"
import { useRouter } from "@tanstack/react-router"
import {
  APIProvider,
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  CollisionBehavior,
  Map as GoogleMap,
  useMap,
} from "@vis.gl/react-google-maps"
import { ArrowRight, Check, PenLine, UserRound, X } from "lucide-react"

import {
  buildCollaborationTrips,
  findLatestCompletedTrip,
  findLatestMissingMineTrip,
  latestTripByRegion,
  mostPickedKeyword,
  resolveRegionAction,
  visibleStickerTrips,
} from "../lib/collaboration"
import { canShowAvailableRegionMarker } from "../lib/availableRegionMarkers"
import { expandBox, isInsideBox, isSameBox } from "../lib/viewportBounds"
import {
  canShowCompletionTip,
  markCompletionTipSeen,
  markCompletionTipShown,
} from "../lib/completionTips"
import {
  buildDisplayFills,
  buildMapFills,
  buildPartyMapFills,
} from "../lib/mapFills"
import {
  createRegionDataLayer,
  isCanonicalRegionCode,
} from "../lib/regionDataLayer"
import { getRecordCameraPadding } from "../lib/cameraPadding"
import { createImageFillOverlay } from "../lib/ImageFillOverlay"
import type { LatLngBox } from "../lib/viewportBounds"
import type { ZoomStage } from "../lib/zoomStage"
import type { CollaborationTrip } from "../lib/collaboration"
import type { RegionDataLayer } from "../lib/regionDataLayer"
import type { ImageFillOverlay } from "../lib/ImageFillOverlay"

import type { RegionFill } from "@/entities/region"
import type {
  CollaborationRecordSeed,
  DecoratePreview,
} from "@/features/travel-record"
import type { TravelKeyword } from "@/entities/photo"
import { findKeyword, useAllPhotos } from "@/entities/photo"
import { formatRegionName, useRegionColorStore } from "@/entities/region"
import {
  selectCurrentPotMembers,
  usePartyMapOverview,
  usePotStore,
} from "@/entities/travel-pot"
import { useSessionStore } from "@/entities/user"
import { showToast } from "@/shared/ui/toast"
import { hasSeenMapTips, openMapTipsOverlay } from "@/features/onboarding"
import { TravelRecordFlow, useRecordStore } from "@/features/travel-record"
import iconAddSrc from "@/shared/assets/icon-add.svg"
import { computeCentroid, computeFeatureBBox } from "@/shared/lib/geo"
import { loadKoreaGeoJson } from "@/shared/lib/loadKoreaGeoJson"
import { REGION_NAME_BY_CODE } from "@/shared/api/region-codes"
import { cn } from "@/shared/lib/utils"
import { ButtonCta } from "@/shared/ui/button-cta"
import { DialogTitle } from "@/shared/ui/dialog"
import { openModal } from "@/shared/ui/modal"

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string
// mapId 미발급 시 Google이 제공하는 프로토타이핑용 데모 ID로 대체 (AdvancedMarker는 mapId 필수)
const GOOGLE_MAP_ID =
  (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined) ||
  "DEMO_MAP_ID"

// 국가 단일 핀 화면에서 시작하고, 한 번 줌인하면 도 단위 집계로 넘어간다
const KOREA_VIEW = { lat: 36.55, lng: 127.2, zoom: 4.8 }

// 기록 시작 기본 위치 — 여름 휴가 데이터가 몰리는 강원도 (Figma 1836-15911 #2).
// zoom은 [+ 지역] 버튼이 보이는 3단계(PARTY_ZOOM)로 바로 진입해 지역을 고를 수 있게 한다.
// ponytail: 초기값 고정, 실제 방문 데이터가 쌓이면 최다 방문 권역으로 교체
const GANGWON_VIEW = { lat: 37.6, lng: 128.5, zoom: 9.5 }

// 여행 팁 안내가 떠 있는 동안 블러 뒤로 비치는 배경 전용 뷰 — 초기 국가 뷰(4.8)는
// 한국이 너무 작아서, 본토가 화면을 채우는 줌으로 당겨 배경답게 보이게 한다
const TIPS_BACKDROP_VIEW = { lat: 36.3, lng: 127.9, zoom: 7 }

// 팟 생성 등 다른 라우트로 이동했다가 돌아올 때 지도가 KOREA_VIEW로 리셋되지 않도록,
// 모듈 스코프에 마지막 카메라 위치를 캐싱해 다음 마운트의 초기값으로 재사용한다.
type CameraSnapshot = {
  lat: number
  lng: number
  zoom: number
}
let lastCameraSnapshot: CameraSnapshot | null = null
const ACCENT = "#6cbcf9" // brand blue (--color-blue-500)
const DASH_DARK = "#232936"
const BOUNDARY_ZOOM = 7.5
const PARTY_ZOOM = 9.5
// 시 레벨에서 조금 더 줌인하면 + 버튼·단순 스티커 상세 단계로 전환한다.
// maxZoom(9.5)까지 기다리면 등록 진입점이 너무 늦게 보인다.
const DETAIL_ENTER_ZOOM = 9
// 2.5단계(인기지역 [+]·지역명 선노출) 진입 줌 — 2단계(7.5)와 3단계(9) 사이 중간값.
// 3단계까지 줌인해야만 등록 진입점이 보이는 불편을 줄인다
const POPULAR_ENTER_ZOOM = 8.25
// 전국(1단계) 뷰 하한 줌 — KOREA_VIEW(4.8)는 국가(0단계)에서 시작한다.
// 6 → 5: 도 단위 집계(1단계) 화면을 더 오래 유지하기 위해 한 단계 낮췄다
const NATION_MIN_ZOOM = 5
// 0단계(국가 뷰) 대표 스티커 위치 — 남한 내륙 중앙부 부근 고정
const KOREA_STICKER_ANCHOR = { lat: 36.4, lng: 127.9 }
const COLLABORATION_TOAST_MS = 4000
const INCOMPLETE_REGION_FILL = "#9eb8ac"
const RECORD_CAMERA_DURATION_MS = 420
// AdvancedMarkerElement는 clickable이면 마커 자체가 포커스 대상이 되고, 그 안의
// 포커스 가능한 자식(button/a/input)은 "not supported"로 경고하며 탭 순서·포커스 링
// 관리가 깨진다. 그래서 마커 콘텐츠는 전부 div/span으로 두고, 클릭과 접근성 이름은
// 마커의 onClick·title이 담당한다.
const MARKER_CONTENT =
  "flex flex-col items-center gap-1 transition-transform hover:scale-110 active:scale-95"
// 하단 툴팁 기준선 — 내비 바닥 오프셋 max(safe-area,33px) + 지구본 상단까지 112px(바 안 16px + 지구본 96px) + 여백 8px.
// dvh 비례로 두면 화면 높이에 따라 지구본에 가려진다 (QA) — 지구본 기준 고정 오프셋으로 계산
const BOTTOM_TOOLTIP_POSITION =
  "bottom-[calc(max(env(safe-area-inset-bottom),33px)_+_120px)]"
// Figma 2466-8293: 상세 줌에서는 [+] 버튼·협업 액션·스티커가 가까이 있어도 동시에 보여야 한다.
const DETAIL_MARKER_COLLISION = CollisionBehavior.REQUIRED
const DETAIL_STICKER_Z_INDEX = 30
const DETAIL_ACTION_Z_INDEX = 40
const DETAIL_TOOLTIP_Z_INDEX = 50
const CATEGORY_PIN_BADGE =
  "inline-flex h-[22px] w-max min-w-[22px] items-center justify-center whitespace-nowrap rounded-full px-1.5 py-0.5 text-h8-1 text-fg-neutral-inverse shadow-[0_0_10px_rgba(142,150,169,0.12)]"
const CATEGORY_PIN_COUNT_BADGE =
  "absolute top-[-8px] -right-1 z-20 flex h-[22px] min-w-5 items-center justify-center rounded-full px-1.5 text-h9 text-fg-neutral-inverse shadow-[0_0_10px_rgba(142,150,169,0.12)]"
const STICKER_OFFSETS = [
  { x: -18, y: -12, rotate: -17 },
  { x: 18, y: 12, rotate: 9 },
]
// STICKER_OFFSETS(px)를 PARTY_ZOOM 화면 기준 위경도로 환산하는 계수.
// CSS translate(px)는 줌아웃해도 화면상 크기가 고정이라 지역이 작아지면 스티커가
// 지역 밖으로 벗어난다 — 좌표 자체에 반영하면 지도와 함께 스케일된다
const STICKER_DEG_PER_PX = 360 / (256 * 2 ** PARTY_ZOOM)

type Centroid = {
  name: string
  lng: number
  lat: number
  /** 소속 도(광역시 포함) — geojson province 속성. 없으면 도 단위 집계에서 제외 */
  province?: string
}

/** 1단계(전국 뷰) 도 단위 집계 — Figma 줌인 기준(1959-6730) */
type ProvinceAggregate = {
  province: string
  keyword: TravelKeyword
  /** 도 소속 전체 지역명 — 1단계에서 도 전체를 색칠할 때 사용 */
  regions: Array<string>
  /** 도 안에서 다녀온 서로 다른 시·군·구 수 — 정책상 +N 배지 */
  regionCount: number
  /** 도 안의 여행 횟수 — 최신 지도 핀 하단 뱃지의 +N */
  visitCount: number
  lat: number
  lng: number
}

type CollaborationRecordDraft = CollaborationRecordSeed &
  Pick<CollaborationTrip, "key" | "region">
type CollaborationProgressMarker = Centroid & { trip: CollaborationTrip }
type TripPinMarker = {
  trip: CollaborationTrip
  keyword: TravelKeyword
  baseLat: number
  baseLng: number
  pinLat: number
  pinLng: number
  rotate: number
  visitCount: number
}
type FeatureBBox = [[number, number], [number, number]]
type CameraPadding = {
  top: number
  bottom: number
  left: number
  right: number
}

const PROVINCE_BADGE_LABELS: Record<string, string> = {
  서울특별시: "서울",
  부산광역시: "부산",
  대구광역시: "대구",
  인천광역시: "인천",
  광주광역시: "광주",
  대전광역시: "대전",
  울산광역시: "울산",
  세종특별자치시: "세종",
  경기도: "경기",
  강원도: "강원",
  강원특별자치도: "강원",
  충청북도: "충북",
  충청남도: "충남",
  전라북도: "전북",
  전북특별자치도: "전북",
  전라남도: "전남",
  경상북도: "경북",
  경상남도: "경남",
  제주특별자치도: "제주",
}

const PROVINCE_NAME_BY_CODE: Record<string, string> = {
  "31": "경기도",
  "32": "강원도",
  "33": "충청북도",
  "34": "충청남도",
  "35": "전라북도",
  "36": "전라남도",
  "37": "경상북도",
  "38": "경상남도",
  "39": "제주특별자치도",
}

function provinceNameByCode(code: string): string | undefined {
  return REGION_NAME_BY_CODE[code] ?? PROVINCE_NAME_BY_CODE[code]
}

function formatProvinceBadgeName(province: string): string {
  return PROVINCE_BADGE_LABELS[province] ?? formatRegionName(province)
}

function formatShortTripRange(startDate: string, endDate: string): string {
  const [startYear, startMonth, startDay] = startDate.split("-")
  const [, endMonth, endDay] = endDate.split("-")
  if (!startYear || !startMonth || !startDay) return startDate
  const yy = startYear.slice(2)
  if (startDate === endDate || !endMonth || !endDay) {
    return `${yy}.${startMonth}.${startDay}`
  }
  if (startMonth === endMonth) {
    return `${yy}.${startMonth}.${startDay}~${endDay}`
  }
  return `${yy}.${startMonth}.${startDay}~${endMonth}.${endDay}`
}

function MapStickerGraphic({
  keyword,
  alt,
  className,
}: {
  keyword: TravelKeyword
  alt: string
  className: string
}) {
  if (keyword.mapStickerFit === "food") {
    return (
      <span className={cn("relative block overflow-hidden", className)}>
        <img
          src={keyword.mapStickerSrc}
          alt={alt}
          className="pointer-events-none absolute top-[3.06%] left-[-19.13%] h-[100.94%] w-[134.59%] max-w-none"
        />
      </span>
    )
  }

  return (
    <img
      src={keyword.mapStickerSrc}
      alt={alt}
      className={cn(
        "pointer-events-none max-w-none",
        keyword.mapStickerFit === "bottom" ? "object-bottom" : "object-cover",
        className
      )}
    />
  )
}

function CategoryMapPin({
  keyword,
  imageAlt,
  bottomBadge,
  topBadge,
}: {
  keyword: TravelKeyword
  imageAlt: string
  bottomBadge?: string
  topBadge?: string
}) {
  const badgeStyle = { backgroundColor: keyword.mapColor }

  return (
    <div className="relative flex w-[46px] flex-col items-center gap-[6px]">
      {topBadge ? (
        <span
          aria-label={`여행 ${topBadge}회`}
          className={CATEGORY_PIN_COUNT_BADGE}
          style={badgeStyle}
        >
          {topBadge}
        </span>
      ) : null}
      <span className="relative h-[46px] w-[46px]">
        <img
          src={keyword.mapPinSrc}
          alt=""
          className="pointer-events-none absolute top-[-2.5px] left-[0.5px] h-[51px] w-[45px] max-w-none"
        />
        <MapStickerGraphic
          keyword={keyword}
          alt={imageAlt}
          className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2"
        />
      </span>
      {bottomBadge ? (
        <span className={CATEGORY_PIN_BADGE} style={badgeStyle}>
          {bottomBadge}
        </span>
      ) : null}
    </div>
  )
}

function MapPillTooltip({
  children,
  className,
  onClick,
  withCaret,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  /**
   * 클릭은 부모(AdvancedMarker)가 받고 모양만 "누를 수 있는 툴팁"으로 두는 경우.
   * 마커 안에서는 버튼을 쓸 수 없다 — MARKER_CONTENT 참고.
   */
  withCaret?: boolean
}) {
  const interactive = Boolean(onClick) || withCaret
  const content = (
    <>
      <span className="min-w-0 truncate text-b6 text-fg-neutral-inverse">
        {children}
      </span>
      {interactive ? (
        <span className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 border-x-[8px] border-t-[8px] border-x-transparent border-t-bg-neutral-inverse" />
      ) : null}
    </>
  )
  const baseClassName = cn(
    "relative flex h-8 max-w-[343px] items-center justify-center rounded-full bg-bg-neutral-inverse px-4 py-1 shadow-[0px_0px_10px_rgba(142,150,169,0.12)]",
    interactive && "transition-transform active:scale-95",
    className
  )

  if (!onClick) {
    return <div className={baseClassName}>{content}</div>
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={baseClassName}
    >
      {content}
    </button>
  )
}

function RecordTripConfirmContent({
  trip,
  regionName,
  onClose,
  onConfirm,
}: {
  trip: CollaborationTrip
  regionName: string
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <>
      <button
        type="button"
        aria-label="닫기"
        className="absolute top-4 right-4 flex size-7 items-center justify-center text-fg-neutral-subtle"
        onClick={onClose}
      >
        <X className="size-5" />
      </button>
      <div className="flex flex-col items-center gap-4 pt-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-bg-neutral-subtle">
          <Check className="size-6 text-fg-neutral-bold" />
        </span>
        <div className="flex flex-col gap-2 py-2">
          <DialogTitle className="text-h5-1 text-fg-neutral-bold">
            {formatShortTripRange(trip.startDate, trip.endDate)}
            <br />
            해당 날짜에 {regionName}을 다녀온게 맞나요?
          </DialogTitle>
          <p className="text-b6 text-fg-neutral-subtle">
            맞다면, 여행 기록을 시작할게요
          </p>
        </div>
      </div>
      <ButtonCta onClick={onConfirm}>맞아요</ButtonCta>
    </>
  )
}

const RegionAddMarkers = React.memo(function RegionAddMarkerLayer({
  markers,
  onStartDecorate,
}: {
  markers: Array<Centroid>
  onStartDecorate: (name: string) => void
}) {
  return (
    <>
      {markers.map(({ name, lng, lat }) => (
        <AdvancedMarker
          key={`centroid-${name}`}
          position={{ lat, lng }}
          anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
          collisionBehavior={DETAIL_MARKER_COLLISION}
          zIndex={DETAIL_ACTION_Z_INDEX}
          // 클릭·접근성은 마커 자체가 처리한다 (MARKER_CONTENT 참고).
          // clickable이 없으면 콘텐츠에 pointer-events:none이 걸려 클릭도 안 먹는다
          clickable
          title={`${name} 꾸미기`}
          onClick={() => onStartDecorate(name)}
        >
          <div className={MARKER_CONTENT}>
            <span className="flex size-7 items-center justify-center rounded-full border-[2.5px] border-stroke-neutral-bold bg-white/70">
              <img src={iconAddSrc} alt="" className="size-5" />
            </span>
            <span className="text-h8-1 text-fg-neutral-bold [text-shadow:0_0_8px_white]">
              {formatRegionName(name)}
            </span>
          </div>
        </AdvancedMarker>
      ))}
    </>
  )
})

const CollaborationProgressMarkers = React.memo(
  function CollaborationProgressMarkerLayer({
    markers,
    onRegionClick,
  }: {
    markers: Array<CollaborationProgressMarker>
    onRegionClick: (name: string) => void
  }) {
    return (
      <>
        {markers.map(({ name, lng, lat, trip }) => (
          <AdvancedMarker
            key={`collaboration-${trip.key}`}
            position={{ lat, lng }}
            anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
            collisionBehavior={DETAIL_MARKER_COLLISION}
            zIndex={DETAIL_ACTION_Z_INDEX}
            clickable
            title={`${formatRegionName(name)} 여행 기록`}
            onClick={() => onRegionClick(name)}
          >
            <div className={MARKER_CONTENT}>
              {/* 연필은 "남은 등록했는데 나는 아직"일 때만 — 내가 등록한 지역은
                  스티커와 겹치지 않게 아이콘 없이 카운터만 보여준다 (QA) */}
              {!trip.hasMine ? (
                <span className="flex size-7 items-center justify-center rounded-full border-[2.5px] border-stroke-neutral-bold bg-white/70">
                  <PenLine className="size-4 text-fg-neutral-bold" />
                </span>
              ) : null}
              <span className="text-h8-1 text-fg-neutral-bold [text-shadow:0_0_8px_white]">
                {formatRegionName(name)}
              </span>
              {/* 아직 기록하지 않은 인원 수 — 완료 인원이 아니다 (Figma 1836-15937 #6) */}
              {trip.hasMine ? (
                <span className="flex items-center gap-0.5 text-h9 [text-shadow:0_0_8px_white]">
                  <UserRound className="size-3.5 text-fg-neutral-solid" />
                  <span className="text-fg-neutral-bold">
                    {trip.missingMemberIds.length}
                  </span>
                  <span className="text-fg-neutral-solid">
                    /{trip.totalMembers}
                  </span>
                </span>
              ) : null}
            </div>
          </AdvancedMarker>
        ))}
      </>
    )
  }
)

const ProvinceAggregateMarkers = React.memo(
  function ProvinceAggregateMarkerLayer({
    aggregates,
  }: {
    aggregates: Array<ProvinceAggregate>
  }) {
    return (
      <>
        {aggregates.map((agg) => (
          <AdvancedMarker
            key={`province-${agg.province}`}
            position={{ lat: agg.lat, lng: agg.lng }}
            anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
          >
            <CategoryMapPin
              keyword={agg.keyword}
              imageAlt={`${formatProvinceBadgeName(agg.province)} 대표 키워드 ${
                agg.keyword.label
              }`}
              bottomBadge={`${formatProvinceBadgeName(agg.province)}+${
                agg.regionCount
              }`}
            />
          </AdvancedMarker>
        ))}
      </>
    )
  }
)

const TripStickerMarkers = React.memo(function TripStickerMarkerLayer({
  pins,
  stickerOnly,
  onTripClick,
}: {
  pins: Array<TripPinMarker>
  stickerOnly: boolean
  onTripClick: (trip: CollaborationTrip) => void
}) {
  return (
    <>
      {pins.map((p) => (
        <AdvancedMarker
          key={`trip-${p.trip.key}`}
          position={{ lat: p.pinLat, lng: p.pinLng }}
          anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
          collisionBehavior={DETAIL_MARKER_COLLISION}
          zIndex={DETAIL_STICKER_Z_INDEX}
          clickable
          title={`${formatRegionName(p.trip.region)} 여행 기록하기`}
          onClick={() => onTripClick(p.trip)}
        >
          {stickerOnly ? (
            <div
              className="transition-transform hover:scale-110 active:scale-95"
              style={{ transform: `rotate(${p.rotate}deg)` }}
            >
              <MapStickerGraphic
                keyword={p.keyword}
                alt=""
                className="size-16 drop-shadow-[0_4px_10px_rgba(35,41,54,0.18)]"
              />
            </div>
          ) : (
            <div className="transition-transform hover:scale-110 active:scale-95">
              <CategoryMapPin
                keyword={p.keyword}
                imageAlt={`${formatRegionName(p.trip.region)} ${
                  p.keyword.label
                }`}
                topBadge={p.visitCount > 1 ? String(p.visitCount) : undefined}
              />
            </div>
          )}
        </AdvancedMarker>
      ))}
    </>
  )
})

// Figma 줌인 기준(2466-8921): 0 국가 / 1 도 / 2 시(핀 유지) /
// 2.5 인기지역 [+]·지역명 선노출 / 3 상세(전 지역 +지역명·추가 버튼·64px 스티커)
function getZoomStage(zoom: number): ZoomStage {
  if (zoom >= DETAIL_ENTER_ZOOM) return 3
  if (zoom >= POPULAR_ENTER_ZOOM) return 2.5
  if (zoom >= BOUNDARY_ZOOM) return 2
  if (zoom >= NATION_MIN_ZOOM) return 1
  return 0
}

// ease-out은 초반에 확 움직여 짧은 duration에선 튀는 느낌 — 완만하게 출발·도착
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2
}

// panTo/setZoom은 duration이 없어 즉시 이동한다(MapLibre flyTo 대비 gap) — moveCamera를
// rAF로 매 프레임 호출해 수동으로 보간하면 유사한 부드러운 이동을 만들 수 있다
function animateCamera(
  map: google.maps.Map,
  target: { lat: number; lng: number; zoom: number },
  duration: number,
  rafRef: React.MutableRefObject<number | null>,
  onComplete?: () => void
) {
  if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
  const startCenter = map.getCenter()
  const startLat = startCenter?.lat() ?? target.lat
  const startLng = startCenter?.lng() ?? target.lng
  const startZoom = map.getZoom() ?? target.zoom
  const startTime = performance.now()

  const step = (now: number) => {
    const t = Math.min(1, (now - startTime) / duration)
    const e = easeInOutCubic(t)
    map.moveCamera({
      center: {
        lat: startLat + (target.lat - startLat) * e,
        lng: startLng + (target.lng - startLng) * e,
      },
      zoom: startZoom + (target.zoom - startZoom) * e,
    })
    if (t < 1) {
      rafRef.current = requestAnimationFrame(step)
      return
    }
    rafRef.current = null
    onComplete?.()
  }
  rafRef.current = requestAnimationFrame(step)
}

const MERCATOR_MAX_LAT = 85.05112878

function lngToWorldX(lng: number): number {
  return (lng + 180) / 360
}

function latToWorldY(lat: number): number {
  const clamped = Math.max(-MERCATOR_MAX_LAT, Math.min(MERCATOR_MAX_LAT, lat))
  const sin = Math.sin((clamped * Math.PI) / 180)
  return 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)
}

function worldXToLng(x: number): number {
  return x * 360 - 180
}

function worldYToLat(y: number): number {
  const n = Math.PI - 2 * Math.PI * y
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
}

function cameraTargetForBounds(
  map: google.maps.Map,
  bbox: FeatureBBox,
  padding: CameraPadding
): { lat: number; lng: number; zoom: number } | null {
  const width = map.getDiv().clientWidth
  const height = map.getDiv().clientHeight
  const availableWidth = width - padding.left - padding.right
  const availableHeight = height - padding.top - padding.bottom
  if (availableWidth <= 0 || availableHeight <= 0) return null

  const [[west, south], [east, north]] = bbox
  const westX = lngToWorldX(west)
  const eastX = lngToWorldX(east)
  const northY = latToWorldY(north)
  const southY = latToWorldY(south)
  const spanX = Math.max(eastX - westX, Number.EPSILON)
  const spanY = Math.max(southY - northY, Number.EPSILON)
  const zoom = Math.min(
    PARTY_ZOOM,
    Math.log2(availableWidth / (spanX * 256)),
    Math.log2(availableHeight / (spanY * 256))
  )
  const scale = 256 * 2 ** zoom
  const paddedCenterX = padding.left + availableWidth / 2
  const paddedCenterY = padding.top + availableHeight / 2
  const viewportCenterX = width / 2
  const viewportCenterY = height / 2
  const centerX =
    (westX + eastX) / 2 - (paddedCenterX - viewportCenterX) / scale
  const centerY =
    (northY + southY) / 2 - (paddedCenterY - viewportCenterY) / scale

  return {
    lat: worldYToLat(centerY),
    lng: worldXToLng(centerX),
    zoom,
  }
}

/** 뷰포트를 사방 25% 넓혀 마커를 미리 만들어둔다 — 가장자리에서 튀어나오듯 나타나는 것 방지 */
const VIEWPORT_BUFFER_RATIO = 0.25

function viewportBoxOf(map: google.maps.Map): LatLngBox | null {
  const bounds = map.getBounds()
  if (!bounds) return null
  const ne = bounds.getNorthEast()
  const sw = bounds.getSouthWest()
  return expandBox(
    { south: sw.lat(), west: sw.lng(), north: ne.lat(), east: ne.lng() },
    VIEWPORT_BUFFER_RATIO
  )
}

function isSameCentroidList(a: Array<Centroid>, b: Array<Centroid>): boolean {
  return a.length === b.length && a.every((centroid, i) => centroid === b[i])
}

/**
 * 뷰포트(+버퍼) 상태 갱신 — 마커 렌더 대상을 화면 근처로 좁히는 단일 진입점.
 * 값이 그대로면 이전 참조를 유지해 불필요한 마커 리렌더를 막는다.
 */
function syncViewportState(
  map: google.maps.Map,
  centroids: Array<Centroid>,
  setViewportBox: React.Dispatch<React.SetStateAction<LatLngBox | null>>,
  setViewportCentroids: React.Dispatch<React.SetStateAction<Array<Centroid>>>
) {
  const box = viewportBoxOf(map)
  setViewportBox((prev) => (isSameBox(prev, box) ? prev : box))
  const next = box
    ? centroids.filter((centroid) => isInsideBox(box, centroid))
    : EMPTY_CENTROIDS
  setViewportCentroids((prev) => (isSameCentroidList(prev, next) ? prev : next))
}

export type TravelMapImplProps = {
  onRegionDetailChange?: (region: string | null) => void
  onAlbumAvailabilityChange?: (available: boolean) => void
  onZoomStageChange?: (stage: ZoomStage) => void
  /** 값이 증가할 때마다 현재 중심을 유지한 채 3단계(상세) 줌으로 카메라 이동 — 줌인 가이드 클릭용 */
  zoomToDetailSignal?: number
  /** 값이 증가할 때마다 한국 전체 뷰(KOREA_VIEW)로 카메라 이동 — 하단 내비 지구본 클릭용 */
  recenterKoreaSignal?: number
  /** Google 기본 지도 타일이 현재 카메라 영역까지 준비된 시점 */
  onTilesLoaded?: () => void
  /** 지역 폴리곤까지 다 그려진 시점 — 래퍼가 로딩 스켈레톤을 내리는 신호 */
  onReady?: () => void
}

export function TravelMapGoogleImpl(props: TravelMapImplProps) {
  const { onReady } = props
  const missingKey = !GOOGLE_MAPS_KEY
  // 키가 없으면 지도가 뜰 일이 없다 — 준비 완료로 알려야 래퍼 스켈레톤이 내려가고
  // 아래 안내 문구가 보인다
  React.useEffect(() => {
    if (missingKey) onReady?.()
  }, [missingKey, onReady])

  if (missingKey) {
    return (
      <div className="flex size-full items-center justify-center bg-muted p-6 text-center text-b6 text-muted-foreground">
        VITE_GOOGLE_MAPS_API_KEY가 설정되지 않았습니다. .env에 Google Maps
        JavaScript API 키를 추가해 주세요.
      </div>
    )
  }
  return (
    <APIProvider apiKey={GOOGLE_MAPS_KEY} libraries={["marker"]}>
      <TravelMapGoogleInner {...props} />
    </APIProvider>
  )
}

/**
 * MapController — 지도 인스턴스 생명주기 + Data 레이어 + 리스너 관리.
 * `<GoogleMap>` 자식으로 렌더돼야 `useMap()`으로 인스턴스를 얻을 수 있음(비주얼 없음).
 */
function MapController({
  mapRef,
  cameraRafRef,
  geojsonRef,
  dataLayerRef,
  overlayRef,
  fills,
  fillsRef,
  photoRegionSet,
  incompleteRegionSet,
  decorating,
  decoratePreview,
  syncVisualsForStage,
  stageSyncedFillsRef,
  setZoomStage,
  setCentroids,
  setViewportCentroids,
  setViewportBox,
  centroidsRef,
  onFeatureClick,
  onReady,
}: {
  mapRef: React.MutableRefObject<google.maps.Map | null>
  cameraRafRef: React.MutableRefObject<number | null>
  geojsonRef: React.MutableRefObject<GeoJSON.FeatureCollection | null>
  dataLayerRef: React.MutableRefObject<RegionDataLayer | null>
  overlayRef: React.MutableRefObject<ImageFillOverlay | null>
  fills: Record<string, RegionFill>
  /** 오버레이 draw()가 항상 최신 fills를 읽도록 ref 경유 (클로저 고정 방지) */
  fillsRef: React.MutableRefObject<Record<string, RegionFill>>
  photoRegionSet: Set<string>
  incompleteRegionSet: Set<string>
  decorating: string | null
  decoratePreview: DecoratePreview | null
  /** 줌 스테이지가 바뀌는 즉시 같은 stage 기준의 fill을 Data layer에 반영 */
  syncVisualsForStage: (stage: ZoomStage) => void
  stageSyncedFillsRef: React.MutableRefObject<Record<string, RegionFill> | null>
  setZoomStage: (stage: ZoomStage) => void
  setCentroids: (c: Array<Centroid>) => void
  setViewportCentroids: React.Dispatch<React.SetStateAction<Array<Centroid>>>
  setViewportBox: React.Dispatch<React.SetStateAction<LatLngBox | null>>
  centroidsRef: React.MutableRefObject<Array<Centroid>>
  onFeatureClick: (name: string) => void
  onReady?: () => void
}) {
  const map = useMap()
  const decoratingRef = React.useRef<string | null>(decorating)
  decoratingRef.current = decorating
  const photoRegionSetRef = React.useRef(photoRegionSet)
  photoRegionSetRef.current = photoRegionSet
  const incompleteRegionSetRef = React.useRef(incompleteRegionSet)
  incompleteRegionSetRef.current = incompleteRegionSet
  // 초기화 effect가 map만 보고 도니, 콜백은 ref 경유로 최신값을 읽는다
  const onReadyRef = React.useRef(onReady)
  onReadyRef.current = onReady

  // 지도 인스턴스별 초기화 — StrictMode 이중 마운트나 리마운트로 vis.gl이 지도를
  // 재생성하면 새 인스턴스에 레이어/리스너를 다시 붙여야 하므로 "1회 가드" 대신
  // map 기준 초기화 + cleanup 으로 관리한다
  React.useEffect(() => {
    if (!map) return
    mapRef.current = map

    // 벡터 지도 소수점 줌 보장 — 없으면 정수 스냅되어 PARTY_ZOOM(9.5) 경계가 동작하지 않음.
    // restriction(strictBounds): 뷰포트가 항상 세계지도(메르카토르 위도 한계 ±85) 안에
    // 갇히도록 — 지도 밖 회색 영역이 보이는 지점까지 줌아웃·팬이 되지 않게 네이티브로
    // 클램프한다 (수동 minZoom 계산은 리사이즈 타이밍에 따라 경계 밖이 새어 보였다)
    map.setOptions({
      isFractionalZoomEnabled: true,
      restriction: {
        latLngBounds: { north: 85, south: -85, west: -180, east: 180 },
        strictBounds: true,
      },
    })

    let cancelled = false
    const listeners: Array<google.maps.MapsEventListener> = []
    let dataLayer: RegionDataLayer | null = null
    let overlay: ImageFillOverlay | null = null

    loadKoreaGeoJson()
      .then((geo) => {
        if (cancelled) return
        const geojson = geo.municipalities
        geojsonRef.current = geojson

        dataLayer = createRegionDataLayer(map, geojson, {
          accent: ACCENT,
          initialZoom: map.getZoom() ?? KOREA_VIEW.zoom,
          onFeatureClick: (name) => {
            if (decoratingRef.current) return
            // 초기 줌(경계선·지역명 미노출)에서는 지역 클릭으로 이동/등록하지 않음
            if ((map.getZoom() ?? 0) < BOUNDARY_ZOOM) return
            onFeatureClick(name)
          },
        })
        dataLayerRef.current = dataLayer

        overlay = createImageFillOverlay(
          () => fillsRef.current,
          () => geojsonRef.current
        )
        overlay.setMap(map)
        overlayRef.current = overlay

        // 동명 지역(강원·경남 고성군)은 정본(코드 일치) centroid만 남긴다 — 이름 키로
        // 도 그룹핑·색칠하는 소비자들이 비정본 지역을 잘못 칠하는 것을 막는다.
        // 판정은 이름이 실제 중복일 때만 — 병합시(포항시 등)는 code가 매핑값과 다르다
        const nameCounts = new Map<string, number>()
        for (const f of geojson.features) {
          const name = f.properties?.name as string | undefined
          if (name) nameCounts.set(name, (nameCounts.get(name) ?? 0) + 1)
        }

        const computed: Array<Centroid> = []
        for (const f of geojson.features) {
          const name = f.properties?.name as string | undefined
          if (!name) continue
          if (
            (nameCounts.get(name) ?? 0) > 1 &&
            !isCanonicalRegionCode(name, f.properties?.code)
          )
            continue
          const center = computeCentroid(f)
          if (center) {
            computed.push({
              name,
              lng: center[0],
              lat: center[1],
              province: f.properties?.province as string | undefined,
            })
          }
        }
        centroidsRef.current = computed
        setCentroids(computed)

        dataLayer.sync({
          fills: fillsRef.current,
          hasPhotoRegions: photoRegionSetRef.current,
          incompleteRegions: incompleteRegionSetRef.current,
        })

        const syncViewport = () =>
          syncViewportState(
            map,
            centroidsRef.current,
            setViewportBox,
            setViewportCentroids
          )
        let syncedVisualStage = getZoomStage(map.getZoom() ?? KOREA_VIEW.zoom)
        const syncStage = (stage: ZoomStage) => {
          if (stage !== syncedVisualStage) {
            syncVisualsForStage(stage)
            syncedVisualStage = stage
          }
          setZoomStage(stage)
        }

        listeners.push(
          map.addListener("zoom_changed", () => {
            const zoom = map.getZoom() ?? KOREA_VIEW.zoom
            // 경계선 minzoom 게이팅은 경계 통과 시에만 전체 재계산한다.
            dataLayer?.syncZoom(zoom)
            const stage = getZoomStage(zoom)
            if (stage !== syncedVisualStage) {
              // 마커/색칠 전환은 idle까지 기다리면 [+] 버튼이 늦게 뜨는 체감이 커서,
              // 줌 단계 경계를 통과한 순간 한 번만 반영한다.
              syncStage(stage)
              syncViewport()
            }
          })
        )
        listeners.push(
          map.addListener("idle", () => {
            const zoom = map.getZoom() ?? KOREA_VIEW.zoom
            const stage = getZoomStage(zoom)
            syncStage(stage)
            syncViewport()
            overlay?.scheduleDraw()
          })
        )
        // 초기 줌 스테이지·뷰포트 반영
        syncStage(getZoomStage(map.getZoom() ?? KOREA_VIEW.zoom))
        syncViewport()

        // 여기서부터 지역 폴리곤이 그려진 상태 — 래퍼가 스켈레톤을 내려도 된다
        onReadyRef.current?.()
      })
      .catch(console.error)

    return () => {
      cancelled = true
      for (const l of listeners) l.remove()
      dataLayer?.destroy()
      overlay?.setMap(null)
      if (dataLayerRef.current === dataLayer) dataLayerRef.current = null
      if (overlayRef.current === overlay) overlayRef.current = null

      // 언마운트 시점 카메라 위치 스냅샷 저장 (다른 라우트 갔다 돌아왔을 때 복원용)
      const center = map.getCenter()
      if (center) {
        lastCameraSnapshot = {
          lat: center.lat(),
          lng: center.lng(),
          zoom: map.getZoom() ?? KOREA_VIEW.zoom,
        }
      }

      if (mapRef.current === map) mapRef.current = null
    }
  }, [
    map,
    mapRef,
    geojsonRef,
    dataLayerRef,
    overlayRef,
    centroidsRef,
    fillsRef,
    onFeatureClick,
    setCentroids,
    setViewportCentroids,
    setViewportBox,
    setZoomStage,
    syncVisualsForStage,
  ])

  // fills/hasPhoto 변경 반영 + 이미지 fill 다시 로드
  React.useEffect(() => {
    const dataLayer = dataLayerRef.current
    const overlay = overlayRef.current
    if (!dataLayer) return

    // 줌 단계 경계에서 이미 같은 fills를 즉시 반영했다면 중복 스타일링을 건너뛴다.
    // 기록/미리보기 변경으로 fills가 달라진 경우에는 이 effect가 정상 반영한다.
    if (stageSyncedFillsRef.current === fills) {
      stageSyncedFillsRef.current = null
      overlay?.loadPendingImages()
      overlay?.scheduleDraw()
      return
    }

    dataLayer.sync({
      fills,
      hasPhotoRegions: photoRegionSet,
      incompleteRegions: incompleteRegionSet,
    })
    overlay?.loadPendingImages()
    overlay?.scheduleDraw()
  }, [
    fills,
    photoRegionSet,
    incompleteRegionSet,
    dataLayerRef,
    overlayRef,
    stageSyncedFillsRef,
  ])

  // 강조선·색상 미리보기 — 스와치 탭마다 fitBounds가 재실행되지 않도록 진입/이탈과 분리
  React.useEffect(() => {
    if (!decorating) return
    dataLayerRef.current?.sync({
      decorateRegion: decorating,
      decorateColor: decoratePreview?.stroke ?? DASH_DARK,
      decoratePreviewColor: decoratePreview?.fill,
    })
  }, [decorating, decoratePreview, dataLayerRef])

  // 등록 플로우 진입/이탈 — 제스처 잠금 + 부드러운 bounds 이동
  React.useEffect(() => {
    if (!map) return
    if (decorating) {
      map.setOptions({ gestureHandling: "none" })
      const feature = geojsonRef.current?.features.find(
        (f) => f.properties?.name === decorating
      )
      const bbox = feature ? computeFeatureBBox(feature) : null
      if (bbox) {
        const target = cameraTargetForBounds(
          map,
          bbox,
          getRecordCameraPadding(
            map.getDiv().clientWidth,
            map.getDiv().clientHeight
          )
        )
        if (target) {
          animateCamera(
            map,
            target,
            RECORD_CAMERA_DURATION_MS,
            cameraRafRef,
            () => {
              const stage = getZoomStage(target.zoom)
              syncVisualsForStage(stage)
              setZoomStage(stage)
              syncViewportState(
                map,
                centroidsRef.current,
                setViewportBox,
                setViewportCentroids
              )
            }
          )
        }
      }
    } else {
      map.setOptions({ gestureHandling: "greedy" })
      dataLayerRef.current?.sync({ decorateRegion: null })
    }
  }, [
    decorating,
    map,
    dataLayerRef,
    geojsonRef,
    centroidsRef,
    cameraRafRef,
    syncVisualsForStage,
  ])

  return null
}

// 아직 꾸미기 이력이 없는 팟의 안정 참조 — 셀렉터가 매번 새 객체를 만들지 않도록
const EMPTY_FILLS: Record<string, RegionFill> = {}
const EMPTY_CENTROIDS: Array<Centroid> = []
const EMPTY_COLLABORATION_PROGRESS_MARKERS: Array<CollaborationProgressMarker> =
  []
const EMPTY_PROVINCE_AGGREGATES: Array<ProvinceAggregate> = []
const EMPTY_TRIP_PIN_MARKERS: Array<TripPinMarker> = []

function cityStagePins(pins: Array<TripPinMarker>): Array<TripPinMarker> {
  const byRegion = new Map<string, TripPinMarker>()
  for (const pin of pins) {
    const prev = byRegion.get(pin.trip.region)
    if (prev && prev.visitCount >= pin.visitCount) continue
    byRegion.set(pin.trip.region, {
      ...pin,
      pinLat: pin.baseLat,
      pinLng: pin.baseLng,
      rotate: 0,
    })
  }
  return [...byRegion.values()]
}

function TravelMapGoogleInner({
  onAlbumAvailabilityChange,
  onRegionDetailChange,
  onZoomStageChange,
  zoomToDetailSignal,
  recenterKoreaSignal,
  onTilesLoaded,
  onReady,
}: TravelMapImplProps) {
  const router = useRouter()
  const currentPotId = usePotStore((s) => s.currentPotId)
  const currentPotName = usePotStore(
    (s) => s.pots.find((pot) => pot.id === s.currentPotId)?.name ?? "우리 팟"
  )
  const photos = useAllPhotos(currentPotId)
  const mapOverviewQuery = usePartyMapOverview(currentPotId)
  const mapOverview = mapOverviewQuery.data
  const fills = useRegionColorStore(
    (s) => s.fillsByPot[currentPotId] ?? EMPTY_FILLS
  )
  const partyMembers = usePotStore(selectCurrentPotMembers)
  const currentUser = useSessionStore((s) => s.currentUser)
  const currentUserId = currentUser?.id ?? null

  const mapRef = React.useRef<google.maps.Map | null>(null)
  const geojsonRef = React.useRef<GeoJSON.FeatureCollection | null>(null)
  const dataLayerRef = React.useRef<RegionDataLayer | null>(null)
  const overlayRef = React.useRef<ImageFillOverlay | null>(null)
  const centroidsRef = React.useRef<Array<Centroid>>([])
  const cameraRafRef = React.useRef<number | null>(null)
  React.useEffect(() => {
    return () => {
      if (cameraRafRef.current !== null)
        cancelAnimationFrame(cameraRafRef.current)
    }
  }, [])
  const [zoomStage, setZoomStage] = React.useState<ZoomStage>(() =>
    getZoomStage(lastCameraSnapshot?.zoom ?? KOREA_VIEW.zoom)
  )
  const zoomStageRef = React.useRef(zoomStage)
  React.useEffect(() => {
    zoomStageRef.current = zoomStage
  }, [zoomStage])
  React.useEffect(() => {
    onZoomStageChange?.(zoomStage)
  }, [onZoomStageChange, zoomStage])
  const [centroids, setCentroids] = React.useState<Array<Centroid>>([])
  const [viewportCentroids, setViewportCentroids] = React.useState<
    Array<Centroid>
  >([])
  // 화면(+버퍼) 범위 — 여행 마커를 이 안쪽만 렌더한다
  const [viewportBox, setViewportBox] = React.useState<LatLngBox | null>(null)
  const [collaborationRecordDraft, setCollaborationRecordDraft] =
    React.useState<CollaborationRecordDraft | null>(null)
  const [mapReady, setMapReady] = React.useState(false)
  // 팁 안내의 시작하기 콜백이 렌더 시점과 무관하게 준비 여부를 읽기 위한 ref
  const mapReadyRef = React.useRef(false)
  const handleMapReady = React.useCallback(() => {
    mapReadyRef.current = true
    setMapReady(true)
    onReady?.()
  }, [onReady])

  const decorating = useRecordStore((s) => s.region)
  const decoratePreview = useRecordStore((s) => s.preview)
  const startDecorate = useRecordStore((s) => s.start)

  const collaborationTrips = React.useMemo(
    () =>
      buildCollaborationTrips({
        photos,
        members: partyMembers,
        currentUserId,
      }),
    [photos, partyMembers, currentUserId]
  )
  const visualTrips = React.useMemo(
    () => collaborationTrips.filter((trip) => trip.hasMine),
    [collaborationTrips]
  )
  const latestMissingMineTrip = React.useMemo(
    () => findLatestMissingMineTrip(collaborationTrips),
    [collaborationTrips]
  )
  const latestIncompleteTrip = React.useMemo(
    () => collaborationTrips.find((trip) => !trip.isComplete) ?? null,
    [collaborationTrips]
  )
  const latestCompletedTrip = React.useMemo(
    () => findLatestCompletedTrip(collaborationTrips),
    [collaborationTrips]
  )
  const latestTripsByRegion = React.useMemo(
    () => latestTripByRegion(collaborationTrips),
    [collaborationTrips]
  )
  const incompleteRegionSet = React.useMemo(
    () =>
      new Set(
        collaborationTrips
          .filter((trip) => !trip.isComplete && trip.hasMine)
          .map((trip) => trip.region)
      ),
    [collaborationTrips]
  )
  const mapFills = React.useMemo(() => {
    if (mapOverview) {
      return buildPartyMapFills({ baseFills: fills, overview: mapOverview })
    }

    return buildMapFills({
      baseFills: fills,
      trips: latestTripsByRegion.values(),
      incompleteRegionFill: INCOMPLETE_REGION_FILL,
    })
  }, [fills, latestTripsByRegion, mapOverview])

  // 1단계(전국 뷰) 도 단위 집계 — 도 안에 기록이 하나라도 있으면 대표 키워드(최다 선택,
  // 동수면 최근 여행)와 여행 횟수를 모아 도 전체 색칠 + 하단 뱃지에 쓴다
  const provinceAggregates = React.useMemo<Array<ProvinceAggregate>>(() => {
    const regionsByProvince = new Map<string, Array<Centroid>>()
    const provinceOf = new Map<string, string>()
    for (const c of centroids) {
      if (!c.province) continue
      provinceOf.set(c.name, c.province)
      const list = regionsByProvince.get(c.province) ?? []
      list.push(c)
      regionsByProvince.set(c.province, list)
    }

    if (mapOverview) {
      return mapOverview.provinces.flatMap((cell) => {
        const province = provinceNameByCode(cell.regionCode)
        const keyword = findKeyword(cell.keyword)
        const members = province ? (regionsByProvince.get(province) ?? []) : []
        if (!province || !keyword || members.length === 0) return []

        return [
          {
            province,
            keyword,
            regions: members.map((member) => member.name),
            regionCount: cell.regionCount,
            visitCount: cell.visitCount,
            lat:
              members.reduce((sum, member) => sum + member.lat, 0) /
              members.length,
            lng:
              members.reduce((sum, member) => sum + member.lng, 0) /
              members.length,
          },
        ]
      })
    }

    const tripsByProvince = new Map<string, Array<CollaborationTrip>>()
    for (const trip of visualTrips) {
      const province = provinceOf.get(trip.region)
      if (!province) continue
      const list = tripsByProvince.get(province) ?? []
      list.push(trip)
      tripsByProvince.set(province, list)
    }

    const aggregates: Array<ProvinceAggregate> = []
    for (const [province, trips] of tripsByProvince) {
      const keyword = findKeyword(mostPickedKeyword(trips))
      const members = regionsByProvince.get(province) ?? []
      if (!keyword || members.length === 0) continue
      aggregates.push({
        province,
        keyword,
        regions: members.map((c) => c.name),
        regionCount: new Set(trips.map((trip) => trip.region)).size,
        visitCount: trips.length,
        // 도 대표 위치 — 소속 지역 centroid 평균 (별도 도 지오메트리 없이 근사)
        lat: members.reduce((sum, c) => sum + c.lat, 0) / members.length,
        lng: members.reduce((sum, c) => sum + c.lng, 0) / members.length,
      })
    }
    return aggregates
  }, [centroids, mapOverview, visualTrips])

  // 0단계(국가 뷰) 대표 핀 — 내가 기록한 여행 중 제일 많이 뽑힌 키워드 1개
  const countryKeyword = React.useMemo(
    () =>
      mapOverview
        ? findKeyword(mapOverview.country?.keyword)
        : findKeyword(mostPickedKeyword(visualTrips)),
    [mapOverview, visualTrips]
  )

  const countryRegionCount = mapOverview
    ? (mapOverview.country?.regionCount ?? 0)
    : new Set(visualTrips.map((trip) => trip.region)).size

  // 1단계 이하(국가·전국 뷰)에선 기록이 있는 도 전체를 대표 키워드 색으로 칠한다
  // (강릉 하나만 등록해도 강원도 전체 색칠 — Figma 줌인 기준 1단계)
  const displayFills = React.useMemo(
    () =>
      buildDisplayFills({
        zoomStage,
        mapFills,
        provinceAggregates,
        countryKeyword,
        centroids,
      }),
    [zoomStage, mapFills, provinceAggregates, countryKeyword, centroids]
  )

  // 오버레이 draw()가 항상 최신 fills를 보도록 동기화 (MapLibre 구현의 fillsRef와 동일)
  const fillsRef = React.useRef(displayFills)
  fillsRef.current = displayFills
  const displayFillInputsRef = React.useRef({
    mapFills,
    provinceAggregates,
    countryKeyword,
    centroids,
  })
  displayFillInputsRef.current = {
    mapFills,
    provinceAggregates,
    countryKeyword,
    centroids,
  }

  // 현재 팟에서 지도 안내를 이미 봤는지 — localStorage 접근이라 마운트 후에만 판정 (SSR 안전)
  const [seenTips, setSeenTips] = React.useState(false)
  React.useEffect(
    () => setSeenTips(hasSeenMapTips(currentPotId)),
    [currentPotId]
  )

  const centroidMap = React.useMemo(
    () => new Map(centroids.map((c) => [c.name, c])),
    [centroids]
  )
  const decoratingCentroid = decorating
    ? centroidMap.get(decorating)
    : undefined

  const visualPhotoRegionSet = React.useMemo(
    () => new Set(visualTrips.map((trip) => trip.region)),
    [visualTrips]
  )
  const photoRegionSetRefForVisuals = React.useRef(visualPhotoRegionSet)
  photoRegionSetRefForVisuals.current = visualPhotoRegionSet
  const incompleteRegionSetRefForVisuals = React.useRef(incompleteRegionSet)
  incompleteRegionSetRefForVisuals.current = incompleteRegionSet
  const stageSyncedFillsRef = React.useRef<Record<string, RegionFill> | null>(
    null
  )
  const syncVisualsForStage = React.useCallback((stage: ZoomStage) => {
    const nextFills = buildDisplayFills({
      zoomStage: stage,
      ...displayFillInputsRef.current,
    })
    fillsRef.current = nextFills
    stageSyncedFillsRef.current = nextFills
    dataLayerRef.current?.sync({
      fills: nextFills,
      hasPhotoRegions: photoRegionSetRefForVisuals.current,
      incompleteRegions: incompleteRegionSetRefForVisuals.current,
    })
    overlayRef.current?.loadPendingImages()
    overlayRef.current?.scheduleDraw()
  }, [])

  React.useEffect(() => {
    onAlbumAvailabilityChange?.(photos.length > 0)
  }, [onAlbumAvailabilityChange, photos.length])

  // 안내 세션에서만 닫힘 상태를 유지한다. 지도를 나갔다 돌아오면 재진입 툴팁을 다시 보여준다.
  const [recordTipDismissedForSession, setRecordTipDismissedForSession] =
    React.useState(false)
  // 안내는 봤지만 아직 기록이 하나도 없는 상태에서, 전국 뷰 이하(0·1단계)일 때만 진입점을 노출
  const showRecordTip =
    seenTips &&
    !recordTipDismissedForSession &&
    photos.length === 0 &&
    !decorating &&
    zoomStage <= 1
  const [dismissedRecordTipKey, setDismissedRecordTipKey] = React.useState<
    string | null
  >(null)
  const [encouragementKey, setEncouragementKey] = React.useState<string | null>(
    null
  )
  const [completionTipKey, setCompletionTipKey] = React.useState<string | null>(
    null
  )
  const countedCompletionTipKeyRef = React.useRef<string | null>(null)
  const encouragementTrip = latestMissingMineTrip ?? latestIncompleteTrip
  const encouragementTripKey = encouragementTrip?.key ?? null
  const latestMissingMineTripKey = latestMissingMineTrip?.key ?? null
  const latestCompletedTripKey = latestCompletedTrip?.key ?? null

  const showEncouragementTip =
    encouragementKey === encouragementTripKey && !decorating

  const showCompletionTip =
    !!latestCompletedTrip &&
    completionTipKey === `${currentPotId}|${latestCompletedTripKey}` &&
    !decorating &&
    zoomStage <= 1
  const encouragementRecorderName = encouragementTrip
    ? (partyMembers.find(
        (member) =>
          member.id === encouragementTrip.representativePhoto.uploaderId
      )?.nickname ?? "팟원")
    : "팟원"
  const encouragementMessage = encouragementTrip
    ? encouragementTrip.representativePhoto.uploaderId === currentUserId
      ? `${formatRegionName(encouragementTrip.region)} 여행 기록이 진행 중이에요!`
      : `‘${encouragementRecorderName}’ 님이 ${formatRegionName(encouragementTrip.region)} 여행 기록을 시작했어요!`
    : ""
  const visibleRecordTip =
    latestMissingMineTrip &&
    dismissedRecordTipKey !== latestMissingMineTrip.key &&
    !decorating
      ? {
          trip: latestMissingMineTrip,
          center: centroidMap.get(latestMissingMineTrip.region),
        }
      : null
  const visibleEncouragementTrip = showEncouragementTip
    ? encouragementTrip
    : null
  const visibleCompletionTrip = showCompletionTip ? latestCompletedTrip : null

  React.useEffect(() => {
    setDismissedRecordTipKey(null)
  }, [latestMissingMineTripKey])

  React.useEffect(() => {
    if (!encouragementTripKey || decorating) {
      setEncouragementKey(null)
      return
    }

    setEncouragementKey(encouragementTripKey)
    const timer = window.setTimeout(
      () => setEncouragementKey(null),
      COLLABORATION_TOAST_MS
    )
    return () => window.clearTimeout(timer)
  }, [decorating, encouragementTripKey])

  React.useEffect(() => {
    if (!latestCompletedTripKey || decorating) {
      setCompletionTipKey(null)
      return
    }

    const key = `${currentPotId}|${latestCompletedTripKey}`
    if (zoomStage > 1 || !canShowCompletionTip(key)) {
      setCompletionTipKey(null)
      return
    }

    setCompletionTipKey(key)
    if (countedCompletionTipKeyRef.current !== key) {
      markCompletionTipShown(key)
      countedCompletionTipKeyRef.current = key
    }
  }, [currentPotId, decorating, latestCompletedTripKey, zoomStage])

  React.useEffect(() => {
    onRegionDetailChange?.(null)
  }, [onRegionDetailChange])

  // Google panTo/setZoom에는 duration이 없어 moveCamera를 rAF로 보간한다.
  const runCameraMove = React.useCallback(
    (target: { lat: number; lng: number; zoom: number }, duration: number) => {
      const map = mapRef.current
      if (!map) return
      animateCamera(map, target, duration, cameraRafRef, () => {
        const stage = getZoomStage(target.zoom)
        syncVisualsForStage(stage)
        setZoomStage(stage)
        syncViewportState(
          map,
          centroidsRef.current,
          setViewportBox,
          setViewportCentroids
        )
        const center = map.getCenter()
        if (center) {
          lastCameraSnapshot = {
            lat: center.lat(),
            lng: center.lng(),
            zoom: map.getZoom() ?? target.zoom,
          }
        }
      })
    },
    [syncVisualsForStage]
  )

  // 줌인 가이드 클릭 — 현재 중심을 유지한 채 3단계(상세) 줌으로 이동
  React.useEffect(() => {
    if (!zoomToDetailSignal) return
    const map = mapRef.current
    if (!map) return
    const center = map.getCenter()
    if (!center) return
    runCameraMove(
      { lat: center.lat(), lng: center.lng(), zoom: DETAIL_ENTER_ZOOM },
      600
    )
  }, [runCameraMove, zoomToDetailSignal])

  // 지구본 내비 클릭 — 지도를 다른 곳(외국 포함)으로 옮겨놨어도 한국 전체 뷰로 복귀
  React.useEffect(() => {
    if (!recenterKoreaSignal) return
    runCameraMove(KOREA_VIEW, 600)
  }, [recenterKoreaSignal, runCameraMove])

  // 팟 단위 1회 노출 — 온보딩 직후 첫 진입은 물론, 지도가 떠 있는 채로 새 팟에
  // 참여(currentPotId 변경)했을 때도 안내가 다시 뜬다. ref는 StrictMode 중복 실행 가드.
  // 지도 준비(mapReady)를 기다리지 않는다 — 로딩 화면이 먼저 보였다가 갑자기
  // 안내가 덮이면 어색해서, 진입 즉시 안내를 띄우고 지도는 블러 뒤에서 로드한다.
  const mapTipsOpenedPotRef = React.useRef<string | null>(null)
  // 지도 준비 전에 시작하기를 누른 경우 — 준비되는 시점에 카메라 이동을 이어서 실행
  const pendingTipsCameraRef = React.useRef(false)
  // 팁이 떠 있는 동안 블러 뒤 지도를 확대 뷰로 — 지도가 늦게 준비되면 그때 당긴다
  const pendingTipsBackdropRef = React.useRef(false)
  React.useEffect(() => {
    if (!currentPotId) return
    if (mapTipsOpenedPotRef.current === currentPotId) return
    if (hasSeenMapTips(currentPotId)) return
    mapTipsOpenedPotRef.current = currentPotId
    const opened = openMapTipsOverlay({
      potId: currentPotId,
      onStart: () => {
        pendingTipsBackdropRef.current = false
        setRecordTipDismissedForSession(true)
        if (mapReadyRef.current) runCameraMove(GANGWON_VIEW, 600)
        else pendingTipsCameraRef.current = true
      },
    })
    if (opened) {
      setSeenTips(true)
      if (mapReadyRef.current) runCameraMove(TIPS_BACKDROP_VIEW, 400)
      else pendingTipsBackdropRef.current = true
    }
  }, [currentPotId, runCameraMove])

  React.useEffect(() => {
    if (!mapReady) return
    // 시작하기가 먼저 눌렸으면 강원 이동이 우선 — 배경 확대는 건너뛴다
    if (pendingTipsCameraRef.current) {
      pendingTipsCameraRef.current = false
      pendingTipsBackdropRef.current = false
      runCameraMove(GANGWON_VIEW, 600)
      return
    }
    if (pendingTipsBackdropRef.current) {
      pendingTipsBackdropRef.current = false
      runCameraMove(TIPS_BACKDROP_VIEW, 400)
    }
  }, [mapReady, runCameraMove])

  const startCollaborationRecord = React.useCallback(
    (trip: CollaborationTrip) => {
      if (!currentUserId) return
      setCollaborationRecordDraft({
        key: trip.key,
        region: trip.region,
        startDate: trip.startDate,
        endDate: trip.endDate,
        ...(trip.keyword ? { keyword: trip.keyword } : {}),
        ...(trip.tripId ? { tripId: trip.tripId } : {}),
      })
      startDecorate(trip.region, "photo")
    },
    [currentUserId, startDecorate]
  )

  const openCollaborationConfirm = React.useCallback(
    (trip: CollaborationTrip) => {
      openModal(
        ({ close }) => (
          <RecordTripConfirmContent
            trip={trip}
            regionName={formatRegionName(trip.region)}
            onClose={() => {
              setDismissedRecordTipKey(null)
              close()
            }}
            onConfirm={() => {
              setDismissedRecordTipKey(null)
              close()
              startCollaborationRecord(trip)
            }}
          />
        ),
        {
          showCloseButton: false,
          className:
            "w-[343px] max-w-[calc(100%-2rem)] gap-4 rounded-[32px] p-4 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]",
        }
      )
    },
    [startCollaborationRecord]
  )

  const latestTripsByRegionRef = React.useRef(latestTripsByRegion)
  React.useEffect(() => {
    latestTripsByRegionRef.current = latestTripsByRegion
  }, [latestTripsByRegion])

  const openCollaborationConfirmRef = React.useRef(openCollaborationConfirm)
  React.useEffect(() => {
    openCollaborationConfirmRef.current = openCollaborationConfirm
  }, [openCollaborationConfirm])

  const startDecorateRef = React.useRef(startDecorate)
  React.useEffect(() => {
    startDecorateRef.current = startDecorate
  }, [startDecorate])

  // 폴리곤·키워드 스티커·협업 마커가 모두 이 한 곳을 탄다 — 경로마다 다른 결론이 나오면
  // "팟원 전원 완료 전엔 다음 여행 금지"(Figma 1836-15937 #6) 규칙이 뚫린다
  const handleRegionAction = React.useCallback(
    (name: string, applyZoomGate: boolean) => {
      const latestTrip = latestTripsByRegionRef.current.get(name)
      // 폴리곤 클릭(applyZoomGate)은 [+] 마커가 보이는 지역에서만 동작 —
      // 마커 노출 조건과 클릭 가능 조건을 한 함수로 일치시킨다
      if (
        applyZoomGate &&
        !canShowAvailableRegionMarker({
          zoomStage: zoomStageRef.current,
          hasIncompleteTrip: Boolean(latestTrip && !latestTrip.isComplete),
          region: name,
        })
      ) {
        return
      }
      const action = resolveRegionAction({
        latestTrip,
        zoomStage: zoomStageRef.current,
        applyZoomGate,
      })

      if (action === "ignore") return
      if (action === "confirm-join") {
        // latestTrip은 confirm-join일 때만 필요하고, 그 분기는 존재를 보장한다
        if (latestTrip) openCollaborationConfirmRef.current(latestTrip)
        return
      }
      if (action === "blocked-toast") {
        showToast({
          message: "모두가 기록해야 다음 여행을 기록할 수 있어요!",
          icon: "alert",
          className: "bottom-[106px]",
        })
        return
      }

      setCollaborationRecordDraft(null)
      startDecorateRef.current(name)
    },
    []
  )

  const handleFeatureClick = React.useCallback(
    (name: string) => handleRegionAction(name, true),
    [handleRegionAction]
  )

  // 협업 마커는 3단계에서만 렌더되는 명시적 클릭 대상이라 폴리곤용 [+] 게이트를 타지 않는다
  const handleCollaborationMarkerClick = React.useCallback(
    (name: string) => handleRegionAction(name, false),
    [handleRegionAction]
  )

  const availableRegionMarkers = React.useMemo<Array<Centroid>>(() => {
    if (decorating) return EMPTY_CENTROIDS
    return viewportCentroids.filter(({ name }) => {
      const latestTrip = latestTripsByRegion.get(name)
      return canShowAvailableRegionMarker({
        zoomStage,
        hasIncompleteTrip: Boolean(latestTrip && !latestTrip.isComplete),
        region: name,
      })
    })
  }, [decorating, latestTripsByRegion, viewportCentroids, zoomStage])

  const handleStartRegionMarkerClick = React.useCallback(
    (name: string) => startDecorateRef.current(name),
    []
  )

  const visibleProvinceAggregates = React.useMemo<Array<ProvinceAggregate>>(
    () =>
      zoomStage === 1 && !decorating
        ? provinceAggregates
        : EMPTY_PROVINCE_AGGREGATES,
    [decorating, provinceAggregates, zoomStage]
  )

  const visiblePins = React.useMemo<Array<TripPinMarker>>(() => {
    const trips = visibleStickerTrips(collaborationTrips)
    const visitCountsByTripKey = new Map<string, number>()
    const regionVisitCounts = new Map<string, number>()
    for (const trip of [...collaborationTrips].reverse()) {
      const nextCount = (regionVisitCounts.get(trip.region) ?? 0) + 1
      regionVisitCounts.set(trip.region, nextCount)
      visitCountsByTripKey.set(trip.key, nextCount)
    }

    const regionCounts = new Map<string, number>()
    const visitCountsByRegion = new Map(
      mapOverview?.municipalities.map((cell) => [
        REGION_NAME_BY_CODE[cell.regionCode],
        cell.visitCount,
      ])
    )
    return trips.flatMap((trip) => {
      const keyword = findKeyword(trip.keyword)
      if (!keyword) return []
      const representative = trip.representativePhoto
      const c = centroidMap.get(trip.region)
      const offsetIndex = regionCounts.get(trip.region) ?? 0
      regionCounts.set(trip.region, offsetIndex + 1)
      const offset = STICKER_OFFSETS[offsetIndex] ?? { x: 0, y: 0, rotate: 0 }
      const baseLat = c?.lat ?? representative.lat
      const baseLng = c?.lng ?? representative.lng
      return [
        {
          trip,
          keyword,
          baseLat,
          baseLng,
          // 화면 y축은 아래로 갈수록 위도 감소, 위도 px 밀도는 메르카토르 보정(cos)
          pinLat:
            baseLat -
            offset.y * STICKER_DEG_PER_PX * Math.cos((baseLat * Math.PI) / 180),
          pinLng: baseLng + offset.x * STICKER_DEG_PER_PX,
          rotate: offset.rotate,
          visitCount:
            visitCountsByRegion.get(trip.region) ??
            visitCountsByTripKey.get(trip.key) ??
            1,
        },
      ]
    })
  }, [collaborationTrips, centroidMap, mapOverview])

  // 스티커는 지역당 최대 2개라 "과거 완료 여행" 스티커가 남아 있다 — 그 스티커를 눌렀어도
  // 판정은 지역의 최신 여행 기준. 명시적으로 누른 경로라 줌 게이트는 적용하지 않는다
  const handleTripMarkerClick = React.useCallback(
    (trip: CollaborationTrip) => handleRegionAction(trip.region, false),
    [handleRegionAction]
  )

  const visibleTripPins = React.useMemo<Array<TripPinMarker>>(() => {
    if (zoomStage < 2 || decorating) return EMPTY_TRIP_PIN_MARKERS
    // 2.5단계도 3단계처럼 오프셋 스티커로 — 핀을 centroid에 두면 [+] 마커와 겹친다 (QA)
    const staged = zoomStage >= 2.5 ? visiblePins : cityStagePins(visiblePins)
    // 화면(+버퍼) 밖 여행은 AdvancedMarker DOM 자체를 만들지 않는다.
    // 좌표는 지역 centroid, 없으면 대표 사진 좌표(baseLat/baseLng) 기준
    if (!viewportBox) return EMPTY_TRIP_PIN_MARKERS
    return staged.filter((pin) =>
      isInsideBox(viewportBox, { lat: pin.baseLat, lng: pin.baseLng })
    )
  }, [decorating, viewportBox, visiblePins, zoomStage])
  const showStickerOnlyPins = zoomStage >= 2.5

  const collaborationMarkers = React.useMemo<
    Array<CollaborationProgressMarker>
  >(() => {
    if (zoomStage < 3 || decorating) return EMPTY_COLLABORATION_PROGRESS_MARKERS
    return viewportCentroids
      .map((centroid) => {
        const trip = latestTripsByRegion.get(centroid.name)
        return trip && !trip.isComplete ? { ...centroid, trip } : null
      })
      .filter((item): item is Centroid & { trip: CollaborationTrip } =>
        Boolean(item)
      )
  }, [decorating, latestTripsByRegion, viewportCentroids, zoomStage])

  return (
    <div className="relative size-full">
      <GoogleMap
        mapId={GOOGLE_MAP_ID}
        defaultCenter={{
          lat: lastCameraSnapshot?.lat ?? KOREA_VIEW.lat,
          lng: lastCameraSnapshot?.lng ?? KOREA_VIEW.lng,
        }}
        defaultZoom={lastCameraSnapshot?.zoom ?? KOREA_VIEW.zoom}
        maxZoom={PARTY_ZOOM}
        gestureHandling="greedy"
        disableDefaultUI
        clickableIcons={false}
        style={{ width: "100%", height: "100%" }}
        onTilesLoaded={onTilesLoaded}
      >
        <MapController
          mapRef={mapRef}
          cameraRafRef={cameraRafRef}
          geojsonRef={geojsonRef}
          dataLayerRef={dataLayerRef}
          overlayRef={overlayRef}
          fills={displayFills}
          fillsRef={fillsRef}
          photoRegionSet={visualPhotoRegionSet}
          incompleteRegionSet={incompleteRegionSet}
          decorating={decorating}
          decoratePreview={decoratePreview}
          syncVisualsForStage={syncVisualsForStage}
          stageSyncedFillsRef={stageSyncedFillsRef}
          setZoomStage={setZoomStage}
          setCentroids={setCentroids}
          setViewportCentroids={setViewportCentroids}
          setViewportBox={setViewportBox}
          centroidsRef={centroidsRef}
          onFeatureClick={handleFeatureClick}
          onReady={handleMapReady}
        />

        {/* 진행 중인 여행이 없는 지역의 [+] 버튼 — 2.5단계는 인기지역만, 3단계부터 전 지역 (Figma 2466-8293) */}
        <RegionAddMarkers
          markers={availableRegionMarkers}
          onStartDecorate={handleStartRegionMarkerClick}
        />

        <CollaborationProgressMarkers
          markers={collaborationMarkers}
          onRegionClick={handleCollaborationMarkerClick}
        />

        {/* 0단계(국가) — 전국 대표 키워드 핀 + 여행 횟수 뱃지 */}
        {zoomStage === 0 && !decorating && countryKeyword ? (
          <AdvancedMarker
            position={KOREA_STICKER_ANCHOR}
            anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
          >
            <CategoryMapPin
              keyword={countryKeyword}
              imageAlt={`대한민국 대표 키워드 ${countryKeyword.label}`}
              bottomBadge={`전국+${countryRegionCount}`}
            />
          </AdvancedMarker>
        ) : null}

        {/* 1단계(전국) — 기록이 있는 도마다 대표 키워드 핀 + 여행 횟수 뱃지 */}
        <ProvinceAggregateMarkers aggregates={visibleProvinceAggregates} />

        {/* 시군구가 보이는 2단계 이상에서만 — 도/국가 단위 뷰에선 기록하기 툴팁을 숨긴다 */}
        {zoomStage >= 2 && visibleRecordTip?.center ? (
          <AdvancedMarker
            position={{
              lat: visibleRecordTip.center.lat,
              lng: visibleRecordTip.center.lng,
            }}
            anchorPoint={AdvancedMarkerAnchorPoint.BOTTOM}
            collisionBehavior={DETAIL_MARKER_COLLISION}
            zIndex={DETAIL_TOOLTIP_Z_INDEX}
            clickable
            title={
              zoomStage >= 3
                ? "탭해서 기록하기"
                : `‘${formatRegionName(visibleRecordTip.trip.region)}’ 기록하기`
            }
            onClick={() => {
              setDismissedRecordTipKey(visibleRecordTip.trip.key)
              openCollaborationConfirm(visibleRecordTip.trip)
            }}
          >
            <div className="-translate-y-8">
              <MapPillTooltip className="gap-1" withCaret>
                {zoomStage >= 3 ? (
                  "탭해서 기록하기"
                ) : (
                  <span className="flex items-center gap-1">
                    {`‘${formatRegionName(visibleRecordTip.trip.region)}’ 기록하기`}
                    <span className="flex size-4 items-center justify-center rounded-full bg-bg-neutral-weak text-fg-neutral-bold">
                      <ArrowRight className="size-3" />
                    </span>
                  </span>
                )}
              </MapPillTooltip>
            </div>
          </AdvancedMarker>
        ) : null}

        {decorating && decoratingCentroid ? (
          <AdvancedMarker
            position={{
              lat: decoratingCentroid.lat,
              lng: decoratingCentroid.lng,
            }}
            anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
          >
            {/* 시안대로 배경 없는 텍스트만 — 지도 지명 라벨과 겹칠 때 대비용 은은한 글로우 */}
            <span className="text-h2 text-fg-neutral-bold [text-shadow:0_0_8px_white]">
              {formatRegionName(decorating)}
            </span>
          </AdvancedMarker>
        ) : null}

        {/* 시/군별 기록 마커는 2단계부터 핀 유지, 2.5단계부터 64px 스티커로 전환 */}
        <TripStickerMarkers
          pins={visibleTripPins}
          stickerOnly={showStickerOnlyPins}
          onTripClick={handleTripMarkerClick}
        />
      </GoogleMap>

      {/* 독려·완료 툴팁은 노출 조건이 독립이라 동시에 뜰 수 있다 (Figma 1836-15926 #3).
          같은 좌표에 겹치지 않게 한 컬럼에 쌓고, 오래 남는 [보러가기]를 아래(기준선)에 둬서
          4초 뒤 독려 툴팁이 사라져도 위치가 흔들리지 않게 한다 */}
      {visibleEncouragementTrip ||
      (visibleCompletionTrip && completionTipKey) ? (
        <div
          className={cn(
            "absolute inset-x-0 z-10 flex flex-col items-center gap-2 px-4",
            BOTTOM_TOOLTIP_POSITION
          )}
        >
          {visibleEncouragementTrip ? (
            <MapPillTooltip className="pointer-events-none">
              {encouragementMessage}
            </MapPillTooltip>
          ) : null}

          {visibleCompletionTrip && completionTipKey ? (
            <MapPillTooltip
              onClick={() => {
                markCompletionTipSeen(completionTipKey)
                setCompletionTipKey(null)
                router.navigate({
                  to: "/travel-album/$region",
                  params: { region: visibleCompletionTrip.region },
                })
              }}
            >
              ‘{currentPotName}’{" "}
              {formatRegionName(visibleCompletionTrip.region)} 여행 기록 완료
              했어요!{" "}
              <span className="underline underline-offset-2">보러가기</span>
            </MapPillTooltip>
          ) : null}
        </div>
      ) : null}

      {/* 안내를 봤지만 아직 아무것도 기록하지 않은 유저에게 진입점을 다시 노출 (Figma 1836-15911 #1-1).
          하단 내비(약 75px) 위에 띄우고, 누르면 기본 위치(강원도)로 줌인해 지역을 고르게 한다 */}
      {showRecordTip ? (
        <button
          type="button"
          onClick={() => {
            setRecordTipDismissedForSession(true)
            runCameraMove(GANGWON_VIEW, 600)
          }}
          className={cn(
            "absolute left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-bg-neutral-inverse px-4 py-2 whitespace-nowrap shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]",
            BOTTOM_TOOLTIP_POSITION
          )}
        >
          <span className="text-b6 text-fg-neutral-inverse">
            최근 여행을 기록해볼까요?
          </span>
          <span className="text-h8 text-fg-neutral-inverse underline">
            기록하기
          </span>
        </button>
      ) : null}

      {decorating && decoratingCentroid ? (
        <TravelRecordFlow
          key={`${decorating}-${collaborationRecordDraft?.key ?? "new"}`}
          region={decorating}
          center={{
            lat: decoratingCentroid.lat,
            lng: decoratingCentroid.lng,
          }}
          collaborationTrip={
            collaborationRecordDraft?.region === decorating
              ? collaborationRecordDraft
              : null
          }
          onClose={() => setCollaborationRecordDraft(null)}
          onComplete={() => setCollaborationRecordDraft(null)}
        />
      ) : null}
    </div>
  )
}
