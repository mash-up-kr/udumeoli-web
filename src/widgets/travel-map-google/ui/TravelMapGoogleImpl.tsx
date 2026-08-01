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
  visibleStickerTrips,
} from "../lib/collaboration"
import {
  canShowCompletionTip,
  markCompletionTipSeen,
  markCompletionTipShown,
} from "../lib/completionTips"
import {
  createBoundaryLayer,
  createRegionDataLayer,
} from "../lib/regionDataLayer"
import { createImageFillOverlay } from "../lib/ImageFillOverlay"
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
import { selectCurrentPotMembers, usePotStore } from "@/entities/travel-pot"
import { useSessionStore } from "@/entities/user"
import { showToast } from "@/shared/ui/toast"
import { hasSeenMapTips } from "@/features/onboarding"
import { TravelRecordFlow, useRecordStore } from "@/features/travel-record"
import iconAddSrc from "@/shared/assets/icon-add.svg"
import { computeCentroid, computeFeatureBBox } from "@/shared/lib/geo"
import { loadKoreaGeoJson } from "@/shared/lib/loadKoreaGeoJson"
import { cn } from "@/shared/lib/utils"
import { ButtonCta } from "@/shared/ui/button-cta"
import { DialogTitle } from "@/shared/ui/dialog"
import { openModal } from "@/shared/ui/modal"

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string
// mapId 미발급 시 Google이 제공하는 프로토타이핑용 데모 ID로 대체 (AdvancedMarker는 mapId 필수)
const GOOGLE_MAP_ID =
  (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined) ||
  "DEMO_MAP_ID"

// 중심을 북서쪽에 둬서 화면상 대한민국이 우측·하단에 놓이게 한다
const KOREA_VIEW = { lat: 36.55, lng: 127.2, zoom: 6.7 }

// 기록 시작 기본 위치 — 여름 휴가 데이터가 몰리는 강원도 (Figma 1836-15911 #2).
// zoom은 [+ 지역] 버튼이 보이는 3단계(PARTY_ZOOM)로 바로 진입해 지역을 고를 수 있게 한다.
// ponytail: 초기값 고정, 실제 방문 데이터가 쌓이면 최다 방문 권역으로 교체
const GANGWON_VIEW = { lat: 37.6, lng: 128.5, zoom: 9.5 }

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
// 관성 줌이 maxZoom 직전(9.4999…)에서 멈춰도 3단계로 인정하는 여유치 (MapLibre 구현과 동일)
const PARTY_ZOOM_EPSILON = 0.01
const PARTY_ENTER = PARTY_ZOOM - PARTY_ZOOM_EPSILON
// 전국(1단계) 뷰 하한 줌 — KOREA_VIEW(6.7)는 1단계에 들고,
// 한반도를 넘어 주변 국가까지 보일 정도로 줌아웃하면 국가(0단계) 뷰가 된다
const NATION_MIN_ZOOM = 6
// 0단계(국가 뷰) 대표 스티커 위치 — 남한 내륙 중앙부 부근 고정
const KOREA_STICKER_ANCHOR = { lat: 36.4, lng: 127.9 }
const COLLABORATION_TOAST_MS = 4000
const INCOMPLETE_REGION_FILL = "#9eb8ac"
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
  lat: number
  lng: number
}

type CollaborationRecordDraft = CollaborationRecordSeed &
  Pick<CollaborationTrip, "key" | "region">

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

function MapPillTooltip({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  const content = (
    <>
      <span className="min-w-0 truncate text-b6 text-fg-neutral-inverse">
        {children}
      </span>
      {onClick ? (
        <span className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 border-x-[8px] border-t-[8px] border-x-transparent border-t-bg-neutral-inverse" />
      ) : null}
    </>
  )
  const baseClassName = cn(
    "relative flex h-8 max-w-[343px] items-center justify-center rounded-full bg-bg-neutral-inverse px-4 py-1 shadow-[0px_0px_10px_rgba(142,150,169,0.12)]",
    onClick && "transition-transform active:scale-95",
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

// Figma 줌인 기준(1959-6730): 0 국가(대표 스티커 1개) / 1 전국(도 단위 집계) /
// 2 시군구(다녀온 지역 색칠 + 스티커) / 3 상세(+지역명·추가 버튼·팟 진행 상태)
function getZoomStage(zoom: number): 0 | 1 | 2 | 3 {
  if (zoom >= PARTY_ENTER) return 3
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
  rafRef: React.MutableRefObject<number | null>
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
    rafRef.current = t < 1 ? requestAnimationFrame(step) : null
  }
  rafRef.current = requestAnimationFrame(step)
}

export type TravelMapImplProps = {
  onRegionDetailChange?: (region: string | null) => void
  onAlbumAvailabilityChange?: (available: boolean) => void
}

export function TravelMapGoogleImpl(props: TravelMapImplProps) {
  if (!GOOGLE_MAPS_KEY) {
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
  geojsonRef,
  dataLayerRef,
  overlayRef,
  fills,
  fillsRef,
  photoRegionSet,
  incompleteRegionSet,
  decorating,
  decoratePreview,
  recordedProvinces,
  hasNationRecord,
  setZoomStage,
  setCentroids,
  setViewportCentroids,
  centroidsRef,
  onFeatureClick,
}: {
  mapRef: React.MutableRefObject<google.maps.Map | null>
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
  /** 기록(여행)이 있는 도 — 1단계 시도 경계선을 이 도들에만 노출 */
  recordedProvinces: Set<string>
  /** 전국 기록 존재 여부 — 0단계 국가 외곽선 노출 조건 (단일 색칠과 동일 게이트) */
  hasNationRecord: boolean
  setZoomStage: (stage: 0 | 1 | 2 | 3) => void
  setCentroids: (c: Array<Centroid>) => void
  setViewportCentroids: React.Dispatch<React.SetStateAction<Array<Centroid>>>
  centroidsRef: React.MutableRefObject<Array<Centroid>>
  onFeatureClick: (name: string) => void
}) {
  const map = useMap()
  const decoratingRef = React.useRef<string | null>(decorating)
  decoratingRef.current = decorating
  const photoRegionSetRef = React.useRef(photoRegionSet)
  photoRegionSetRef.current = photoRegionSet
  const incompleteRegionSetRef = React.useRef(incompleteRegionSet)
  incompleteRegionSetRef.current = incompleteRegionSet
  const recordedProvincesRef = React.useRef(recordedProvinces)
  recordedProvincesRef.current = recordedProvinces
  const hasNationRecordRef = React.useRef(hasNationRecord)
  hasNationRecordRef.current = hasNationRecord
  // 기록 변화 시 idle을 기다리지 않고 경계선 노출을 재평가하기 위한 재동기화 핸들
  const syncBoundaryLayersRef = React.useRef<(() => void) | null>(null)

  // 지도 인스턴스별 초기화 — StrictMode 이중 마운트나 리마운트로 vis.gl이 지도를
  // 재생성하면 새 인스턴스에 레이어/리스너를 다시 붙여야 하므로 "1회 가드" 대신
  // map 기준 초기화 + cleanup 으로 관리한다
  React.useEffect(() => {
    if (!map) return
    mapRef.current = map

    // 벡터 지도 소수점 줌 보장 — 없으면 정수 스냅되어 PARTY_ZOOM(9.5) 경계가 동작하지 않음
    map.setOptions({ isFractionalZoomEnabled: true })

    let cancelled = false
    const listeners: Array<google.maps.MapsEventListener> = []
    let dataLayer: RegionDataLayer | null = null
    let overlay: ImageFillOverlay | null = null
    let provinceBoundary: google.maps.Data | null = null
    let nationBoundary: google.maps.Data | null = null

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

        // 0·1단계 상위 경계선 (0: 국가 외곽, 1: 시도 경계) — 여행 기록이 있는 곳에만
        // 테두리를 씌운다. 노출 전환은 마커 갱신과 같은 idle 시점에만 해 제스처 중
        // 레이어 교체를 피한다
        provinceBoundary = createBoundaryLayer(geo.provinces)
        nationBoundary = createBoundaryLayer(geo.nation)
        const syncBoundaryLayers = (stage: 0 | 1 | 2 | 3) => {
          nationBoundary?.setMap(
            stage === 0 && hasNationRecordRef.current ? map : null
          )
          const province = provinceBoundary
          if (!province) return
          province.forEach((f) =>
            province.overrideStyle(f, {
              visible: recordedProvincesRef.current.has(
                String(f.getProperty("name"))
              ),
            })
          )
          province.setMap(stage === 1 ? map : null)
        }
        syncBoundaryLayersRef.current = () =>
          syncBoundaryLayers(getZoomStage(map.getZoom() ?? KOREA_VIEW.zoom))

        const computed: Array<Centroid> = []
        for (const f of geojson.features) {
          const name = f.properties?.name as string | undefined
          if (!name) continue
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

        const syncViewport = () => {
          const bounds = map.getBounds()
          if (!bounds) return
          const next = centroidsRef.current.filter(({ lng, lat }) =>
            bounds.contains({ lat, lng })
          )
          // 팬 후 멤버십이 그대로면 이전 배열을 유지해 idle마다 마커가 리렌더되는 것을 막는다
          setViewportCentroids((prev) =>
            prev.length === next.length && prev.every((c, i) => c === next[i])
              ? prev
              : next
          )
        }

        listeners.push(
          map.addListener("zoom_changed", () => {
            // 제스처 중에는 경계선 minzoom 게이팅만 실시간 반영 (경계 통과 시에만 재계산)
            dataLayer?.syncZoom(map.getZoom() ?? KOREA_VIEW.zoom)
          })
        )
        listeners.push(
          map.addListener("idle", () => {
            // 줌 스테이지 갱신(마커 수십 개 mount/unmount)은 제스처가 끝난 뒤로 미룬다 —
            // zoom_changed마다 하면 스테이지 경계(7.5/8.5/9.5) 통과 순간 줌 애니메이션이 끊긴다
            const zoom = map.getZoom() ?? KOREA_VIEW.zoom
            setZoomStage(getZoomStage(zoom))
            syncBoundaryLayers(getZoomStage(zoom))
            syncViewport()
            overlay?.draw()
          })
        )
        // 초기 줌 스테이지·뷰포트 반영
        setZoomStage(getZoomStage(map.getZoom() ?? KOREA_VIEW.zoom))
        syncBoundaryLayers(getZoomStage(map.getZoom() ?? KOREA_VIEW.zoom))
        syncViewport()
      })
      .catch(console.error)

    return () => {
      cancelled = true
      for (const l of listeners) l.remove()
      dataLayer?.destroy()
      overlay?.setMap(null)
      provinceBoundary?.setMap(null)
      nationBoundary?.setMap(null)
      syncBoundaryLayersRef.current = null
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
    setZoomStage,
  ])

  // 기록 변화(기록 있는 도 추가/삭제 등) 시 경계선 노출을 즉시 재평가
  React.useEffect(() => {
    syncBoundaryLayersRef.current?.()
  }, [recordedProvinces, hasNationRecord])

  // fills/hasPhoto 변경 반영 + 이미지 fill 다시 로드
  React.useEffect(() => {
    const dataLayer = dataLayerRef.current
    const overlay = overlayRef.current
    if (!dataLayer) return
    dataLayer.sync({
      fills,
      hasPhotoRegions: photoRegionSet,
      incompleteRegions: incompleteRegionSet,
    })
    overlay?.loadPendingImages(() => overlay.draw())
    overlay?.draw()
  }, [fills, photoRegionSet, incompleteRegionSet, dataLayerRef, overlayRef])

  // 강조선·색상 미리보기 — 스와치 탭마다 fitBounds가 재실행되지 않도록 진입/이탈과 분리
  React.useEffect(() => {
    if (!decorating) return
    dataLayerRef.current?.sync({
      decorateRegion: decorating,
      decorateColor: decoratePreview?.stroke ?? DASH_DARK,
      decoratePreviewColor: decoratePreview?.fill,
    })
  }, [decorating, decoratePreview, dataLayerRef])

  // 등록 플로우 진입/이탈 — 제스처 잠금 + fitBounds
  React.useEffect(() => {
    if (!map) return
    if (decorating) {
      map.setOptions({ gestureHandling: "none" })
      const feature = geojsonRef.current?.features.find(
        (f) => f.properties?.name === decorating
      )
      const bbox = feature ? computeFeatureBBox(feature) : null
      if (bbox) {
        // Google fitBounds는 애니메이션 옵션이 없어 즉시 이동 (MapLibre 대비 gap)
        map.fitBounds(
          {
            south: bbox[0][1],
            west: bbox[0][0],
            north: bbox[1][1],
            east: bbox[1][0],
          },
          { top: 170, bottom: 330, left: 48, right: 48 }
        )
      }
    } else {
      map.setOptions({ gestureHandling: "greedy" })
      dataLayerRef.current?.sync({ decorateRegion: null })
    }
  }, [decorating, map, dataLayerRef, geojsonRef])

  return null
}

// 아직 꾸미기 이력이 없는 팟의 안정 참조 — 셀렉터가 매번 새 객체를 만들지 않도록
const EMPTY_FILLS: Record<string, RegionFill> = {}

function TravelMapGoogleInner({
  onAlbumAvailabilityChange,
  onRegionDetailChange,
}: TravelMapImplProps) {
  const router = useRouter()
  const currentPotId = usePotStore((s) => s.currentPotId)
  const currentPotName = usePotStore(
    (s) => s.pots.find((pot) => pot.id === s.currentPotId)?.name ?? "우리 팟"
  )
  const photos = useAllPhotos(currentPotId)
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
  const [zoomStage, setZoomStage] = React.useState<0 | 1 | 2 | 3>(() =>
    getZoomStage(lastCameraSnapshot?.zoom ?? KOREA_VIEW.zoom)
  )
  const zoomStageRef = React.useRef(zoomStage)
  React.useEffect(() => {
    zoomStageRef.current = zoomStage
  }, [zoomStage])
  const [centroids, setCentroids] = React.useState<Array<Centroid>>([])
  const [viewportCentroids, setViewportCentroids] = React.useState<
    Array<Centroid>
  >([])
  const [collaborationRecordDraft, setCollaborationRecordDraft] =
    React.useState<CollaborationRecordDraft | null>(null)

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
          .filter((trip) => !trip.isComplete)
          .map((trip) => trip.region)
      ),
    [collaborationTrips]
  )
  const mapFills = React.useMemo<Record<string, RegionFill>>(() => {
    const next: Record<string, RegionFill> = { ...fills }
    for (const trip of latestTripsByRegion.values()) {
      if (
        Object.hasOwn(next, trip.region) &&
        next[trip.region].type === "image"
      )
        continue
      const keyword = findKeyword(trip.keyword)
      if (keyword && (trip.hasMine || trip.isComplete)) {
        next[trip.region] ??= { type: "color", value: keyword.fill }
      } else if (!trip.isComplete) {
        next[trip.region] ??= { type: "color", value: INCOMPLETE_REGION_FILL }
      }
    }
    return next
  }, [fills, latestTripsByRegion])

  // 1단계(전국 뷰) 도 단위 집계 — 도 안에 기록이 하나라도 있으면 대표 키워드(최다 선택,
  // 동수면 최근 여행)와 등록 지역 수를 모아 도 전체 색칠 + 스티커/[+N] 뱃지에 쓴다
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

    const tripsByProvince = new Map<string, Array<CollaborationTrip>>()
    for (const trip of collaborationTrips) {
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
        // 도 대표 위치 — 소속 지역 centroid 평균 (별도 도 지오메트리 없이 근사)
        lat: members.reduce((sum, c) => sum + c.lat, 0) / members.length,
        lng: members.reduce((sum, c) => sum + c.lng, 0) / members.length,
      })
    }
    return aggregates
  }, [centroids, collaborationTrips])

  // 기록이 있는 도 — 1단계 시도 경계선을 이 도들에만 씌운다
  const recordedProvinces = React.useMemo(
    () => new Set(provinceAggregates.map((agg) => agg.province)),
    [provinceAggregates]
  )

  // 0단계(국가 뷰) 대표 스티커 — 전국에서 제일 많이 뽑힌 키워드 1개
  const countryKeyword = React.useMemo(
    () => findKeyword(mostPickedKeyword(collaborationTrips)),
    [collaborationTrips]
  )

  // 1단계 이하(국가·전국 뷰)에선 기록이 있는 도 전체를 대표 키워드 색으로 칠한다
  // (강릉 하나만 등록해도 강원도 전체 색칠 — Figma 줌인 기준 1단계)
  const displayFills = React.useMemo<Record<string, RegionFill>>(() => {
    // 0단계(국가 뷰) — 기록이 있으면 대한민국 전체를 전국 대표 키워드 색 하나로 칠한다
    if (zoomStage === 0 && countryKeyword && centroids.length > 0) {
      const next: Record<string, RegionFill> = {}
      for (const { name } of centroids) {
        next[name] = { type: "color", value: countryKeyword.fill }
      }
      return next
    }
    if (zoomStage >= 2 || provinceAggregates.length === 0) return mapFills
    const next: Record<string, RegionFill> = { ...mapFills }
    for (const agg of provinceAggregates) {
      for (const region of agg.regions) {
        // 사진 채움(image)은 유지 — 색만 도 대표 색으로 통일
        if (Object.hasOwn(next, region) && next[region].type === "image") {
          continue
        }
        next[region] = { type: "color", value: agg.keyword.fill }
      }
    }
    return next
  }, [zoomStage, mapFills, provinceAggregates, countryKeyword, centroids])

  // 오버레이 draw()가 항상 최신 fills를 보도록 동기화 (MapLibre 구현의 fillsRef와 동일)
  const fillsRef = React.useRef(displayFills)
  React.useEffect(() => {
    fillsRef.current = displayFills
  }, [displayFills])

  // 지도 안내를 이미 본 유저인지 — localStorage 접근이라 마운트 후에만 판정 (SSR 안전)
  const [seenTips, setSeenTips] = React.useState(false)
  React.useEffect(() => setSeenTips(hasSeenMapTips()), [])

  const centroidMap = React.useMemo(
    () => new Map(centroids.map((c) => [c.name, c])),
    [centroids]
  )

  const photoRegionSet = React.useMemo(
    () => new Set(photos.map((p) => p.region)),
    [photos]
  )

  React.useEffect(() => {
    onAlbumAvailabilityChange?.(photos.length > 0)
  }, [onAlbumAvailabilityChange, photos.length])

  // 안내는 봤지만 아직 기록이 하나도 없는 상태에서, 전국 뷰 이하(0·1단계)일 때만 진입점을 노출
  const showRecordTip =
    seenTips && photos.length === 0 && !decorating && zoomStage <= 1
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
      animateCamera(map, target, duration, cameraRafRef)
    },
    []
  )

  const startCollaborationRecord = React.useCallback(
    (trip: CollaborationTrip) => {
      if (!currentUserId) return
      setCollaborationRecordDraft({
        key: trip.key,
        region: trip.region,
        startDate: trip.startDate,
        endDate: trip.endDate,
        ...(trip.keyword ? { keyword: trip.keyword } : {}),
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

  const handleFeatureClick = React.useCallback((name: string) => {
    const latestTrip = latestTripsByRegionRef.current.get(name)
    if (!latestTrip) {
      setCollaborationRecordDraft(null)
      startDecorateRef.current(name)
      return
    }

    const stage = zoomStageRef.current
    if (!latestTrip.isComplete && stage < 3) return

    if (!latestTrip.hasMine) {
      openCollaborationConfirmRef.current(latestTrip)
      return
    }

    if (!latestTrip.isComplete) {
      showToast({
        message: "모두가 기록해야 다음 여행을 기록할 수 있어요!",
        icon: "alert",
        className: "bottom-[106px]",
      })
      return
    }

    setCollaborationRecordDraft(null)
    startDecorateRef.current(name)
  }, [])

  const visiblePins = React.useMemo(() => {
    const trips = visibleStickerTrips(collaborationTrips)
    const regionCounts = new Map<string, number>()
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
          // 화면 y축은 아래로 갈수록 위도 감소, 위도 px 밀도는 메르카토르 보정(cos)
          pinLat:
            baseLat -
            offset.y * STICKER_DEG_PER_PX * Math.cos((baseLat * Math.PI) / 180),
          pinLng: baseLng + offset.x * STICKER_DEG_PER_PX,
          rotate: offset.rotate,
        },
      ]
    })
  }, [collaborationTrips, centroidMap])

  const handleTripMarkerClick = React.useCallback(
    (trip: CollaborationTrip) => {
      if (!trip.isComplete) {
        showToast({
          message: "모두가 기록해야 다음 여행을 기록할 수 있어요!",
          icon: "alert",
          className: "bottom-[106px]",
        })
        return
      }

      setCollaborationRecordDraft(null)
      startDecorate(trip.region)
    },
    [startDecorate]
  )

  const collaborationMarkers = React.useMemo(
    () =>
      viewportCentroids
        .map((centroid) => {
          const trip = latestTripsByRegion.get(centroid.name)
          return trip && !trip.isComplete ? { ...centroid, trip } : null
        })
        .filter((item): item is Centroid & { trip: CollaborationTrip } =>
          Boolean(item)
        ),
    [latestTripsByRegion, viewportCentroids]
  )

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
      >
        <MapController
          mapRef={mapRef}
          geojsonRef={geojsonRef}
          dataLayerRef={dataLayerRef}
          overlayRef={overlayRef}
          fills={displayFills}
          fillsRef={fillsRef}
          photoRegionSet={photoRegionSet}
          incompleteRegionSet={incompleteRegionSet}
          decorating={decorating}
          decoratePreview={decoratePreview}
          recordedProvinces={recordedProvinces}
          hasNationRecord={Boolean(countryKeyword)}
          setZoomStage={setZoomStage}
          setCentroids={setCentroids}
          setViewportCentroids={setViewportCentroids}
          centroidsRef={centroidsRef}
          onFeatureClick={handleFeatureClick}
        />

        {/* 지역명 + [+] 버튼은 3단계에서만 — 2단계는 "시/군별 스티커만" (Figma 줌인 기준 2·3단계) */}
        {zoomStage >= 3 &&
          !decorating &&
          viewportCentroids
            .filter(
              ({ name }) =>
                !Object.hasOwn(mapFills, name) && !photoRegionSet.has(name)
            )
            .map(({ name, lng, lat }) => (
              <AdvancedMarker
                key={`centroid-${name}`}
                position={{ lat, lng }}
                anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
                // clickable이 없으면 콘텐츠에 pointer-events:none이 걸려 내부 버튼 클릭 불가
                clickable
              >
                <button
                  type="button"
                  aria-label={`${name} 꾸미기`}
                  onClick={(e) => {
                    e.stopPropagation()
                    startDecorate(name)
                  }}
                  className="flex flex-col items-center gap-1 transition-transform hover:scale-110 active:scale-95"
                >
                  <span className="flex size-7 items-center justify-center rounded-full border-[2.5px] border-stroke-neutral-bold bg-white/70">
                    <img src={iconAddSrc} alt="" className="size-5" />
                  </span>
                  <span className="text-h9 text-fg-neutral-bold [text-shadow:0_0_8px_white]">
                    {formatRegionName(name)}
                  </span>
                </button>
              </AdvancedMarker>
            ))}

        {zoomStage >= 3 &&
          !decorating &&
          collaborationMarkers.map(({ name, lng, lat, trip }) => (
            <AdvancedMarker
              key={`collaboration-${trip.key}`}
              position={{ lat, lng }}
              anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
              clickable
            >
              <button
                type="button"
                aria-label={`${formatRegionName(name)} 여행 기록`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleFeatureClick(name)
                }}
                className="flex flex-col items-center gap-1 transition-transform hover:scale-110 active:scale-95"
              >
                <span className="flex size-7 items-center justify-center rounded-full border-[2.5px] border-stroke-neutral-bold bg-white/70">
                  {trip.hasMine ? (
                    <PenLine className="size-4 text-fg-neutral-bold" />
                  ) : (
                    <img src={iconAddSrc} alt="" className="size-5" />
                  )}
                </span>
                <span className="text-h9 text-fg-neutral-bold [text-shadow:0_0_8px_white]">
                  {formatRegionName(name)}
                </span>
                {trip.hasMine ? (
                  <span className="flex items-center gap-0.5 text-h9 [text-shadow:0_0_8px_white]">
                    <UserRound className="size-3.5 text-fg-neutral-solid" />
                    <span className="text-fg-neutral-bold">
                      {trip.uploadedCount}
                    </span>
                    <span className="text-fg-neutral-solid">
                      /{trip.totalMembers}
                    </span>
                  </span>
                ) : null}
              </button>
            </AdvancedMarker>
          ))}

        {/* 0단계(국가) — 전국에서 제일 많이 뽑힌 키워드 스티커 1개만 노출 */}
        {zoomStage === 0 && !decorating && countryKeyword ? (
          <AdvancedMarker
            position={KOREA_STICKER_ANCHOR}
            anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
          >
            <img
              src={countryKeyword.emojiSrc}
              alt={`대한민국 대표 키워드 ${countryKeyword.label}`}
              className="size-10"
            />
          </AdvancedMarker>
        ) : null}

        {/* 1단계(전국) — 기록이 있는 도마다 대표 키워드 스티커 1개 */}
        {zoomStage === 1 &&
          !decorating &&
          provinceAggregates.map((agg) => (
            <AdvancedMarker
              key={`province-${agg.province}`}
              position={{ lat: agg.lat, lng: agg.lng }}
              anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
            >
              <img
                src={agg.keyword.emojiSrc}
                alt={`${agg.province} 대표 키워드 ${agg.keyword.label}`}
                className="size-14"
              />
            </AdvancedMarker>
          ))}

        {/* 전국 뷰(1단계) 이상에서만 — 국가 뷰(0단계)로 줌아웃하면 기록하기 툴팁도 숨긴다 */}
        {zoomStage >= 1 && visibleRecordTip?.center ? (
          <AdvancedMarker
            position={{
              lat: visibleRecordTip.center.lat,
              lng: visibleRecordTip.center.lng,
            }}
            anchorPoint={AdvancedMarkerAnchorPoint.BOTTOM}
            clickable
          >
            <div className="-translate-y-8">
              <MapPillTooltip
                className="gap-1"
                onClick={() => {
                  setDismissedRecordTipKey(visibleRecordTip.trip.key)
                  openCollaborationConfirm(visibleRecordTip.trip)
                }}
              >
                {zoomStage >= 3 ? (
                  "탭해서 기록하기"
                ) : (
                  <span className="flex items-center gap-1">
                    ‘{formatRegionName(visibleRecordTip.trip.region)}’ 기록하기
                    <span className="flex size-4 items-center justify-center rounded-full bg-bg-neutral-weak text-fg-neutral-bold">
                      <ArrowRight className="size-3" />
                    </span>
                  </span>
                )}
              </MapPillTooltip>
            </div>
          </AdvancedMarker>
        ) : null}

        {decorating && centroidMap.get(decorating) ? (
          <AdvancedMarker
            position={{
              lat: centroidMap.get(decorating)!.lat,
              lng: centroidMap.get(decorating)!.lng,
            }}
            anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
          >
            {/* 시안대로 배경 없는 텍스트만 — 지도 지명 라벨과 겹칠 때 대비용 은은한 글로우 */}
            <span className="text-h2 text-fg-neutral-bold [text-shadow:0_0_8px_white]">
              {formatRegionName(decorating)}
            </span>
          </AdvancedMarker>
        ) : null}

        {/* 시/군별 스티커는 2단계부터 — 1단계 이하는 도/국가 단위 대표 스티커로 대체 */}
        {zoomStage >= 2 &&
          !decorating &&
          visiblePins.map((p) => (
            <AdvancedMarker
              key={`trip-${p.trip.key}`}
              position={{ lat: p.pinLat, lng: p.pinLng }}
              anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
              clickable
            >
              <button
                type="button"
                aria-label={`${formatRegionName(p.trip.region)} 여행 기록하기`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleTripMarkerClick(p.trip)
                }}
                className="transition-transform hover:scale-110 active:scale-95"
                style={{ transform: `rotate(${p.rotate}deg)` }}
              >
                <img src={p.keyword.emojiSrc} alt="" className="size-10" />
              </button>
            </AdvancedMarker>
          ))}
      </GoogleMap>

      {visibleEncouragementTrip ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-[130px] z-10 flex justify-center px-4">
          <MapPillTooltip>{encouragementMessage}</MapPillTooltip>
        </div>
      ) : null}

      {visibleCompletionTrip && completionTipKey ? (
        <div className="absolute inset-x-0 bottom-[130px] z-10 flex justify-center px-4">
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
            ‘{currentPotName}’ {formatRegionName(visibleCompletionTrip.region)}{" "}
            여행 기록 완료 했어요!{" "}
            <span className="underline underline-offset-2">보러가기</span>
          </MapPillTooltip>
        </div>
      ) : null}

      {/* 안내를 봤지만 아직 아무것도 기록하지 않은 유저에게 진입점을 다시 노출 (Figma 1836-15911 #1-1).
          하단 내비(약 75px) 위에 띄우고, 누르면 기본 위치(강원도)로 줌인해 지역을 고르게 한다 */}
      {showRecordTip ? (
        <button
          type="button"
          onClick={() => runCameraMove(GANGWON_VIEW, 600)}
          className="absolute bottom-[130px] left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-bg-neutral-inverse px-4 py-2 whitespace-nowrap shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]"
        >
          <span className="text-b6 text-fg-neutral-inverse">
            최근 여행을 기록해볼까요?
          </span>
          <span className="text-h8 text-fg-neutral-inverse underline">
            기록하기
          </span>
        </button>
      ) : null}

      {decorating && centroidMap.get(decorating) ? (
        <TravelRecordFlow
          key={`${decorating}-${collaborationRecordDraft?.key ?? "new"}`}
          region={decorating}
          center={{
            lat: centroidMap.get(decorating)!.lat,
            lng: centroidMap.get(decorating)!.lng,
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
