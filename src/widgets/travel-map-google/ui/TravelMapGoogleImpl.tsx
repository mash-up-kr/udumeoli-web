/**
 * Google Maps 이식 스파이크 (#76) — MapLibre 구현(widgets/travel-map)의 전체 기능 포팅.
 *
 * 확정 아님, PoC 검증용. 알려진 gap (자세한 내용은 루트 GOOGLE_MAPS_SPEC.md):
 * - flyTo/fitBounds 애니메이션: Google panTo/fitBounds는 duration 옵션이 없어 즉시 이동
 * - 배경 타일: MapTiler 파스텔 스타일 재현 불가, Google 기본 스타일 그대로 사용
 * - AdvancedMarker는 mapId(Cloud Console 발급 또는 DEMO_MAP_ID)가 필요
 */
import * as React from "react"
import {
  APIProvider,
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  Map as GoogleMap,
  useMap,
} from "@vis.gl/react-google-maps"
import { Plus } from "lucide-react"

import { createRegionDataLayer } from "../lib/regionDataLayer"
import { createImageFillOverlay } from "../lib/ImageFillOverlay"
import type { RegionDataLayer } from "../lib/regionDataLayer"
import type { ImageFillOverlay } from "../lib/ImageFillOverlay"

import type { RegionFill } from "@/entities/region"
import type { DecoratePreview } from "@/features/region-decorate"
import {
  REGION_CENTERS,
  useAllPhotos,
  usePhotoUploadStore,
} from "@/entities/photo"
import {
  POPULAR_REGIONS,
  formatRegionName,
  useRegionColorStore,
} from "@/entities/region"
import { selectCurrentPotMembers, usePotStore } from "@/entities/travel-pot"
import { useSessionStore } from "@/entities/user"
import { ButtonIcon } from "@/shared/ui/button-icon"
import { showToast } from "@/shared/ui/toast"
import { GalleryPanel, openPhotoViewer } from "@/features/photo-gallery"
import { pickImageFile } from "@/features/photo-upload"
import {
  RegionDecorateFlow,
  partySlotOffset,
  useDecorateStore,
} from "@/features/region-decorate"
import iconAddSrc from "@/shared/assets/icon-add.svg"
import iconArrowLeftSrc from "@/shared/assets/icon-arrow-left.svg"
import { computeCentroid, computeFeatureBBox } from "@/shared/lib/geo"
import { loadKoreaGeoJson } from "@/shared/lib/loadKoreaGeoJson"
import { PhotoTile } from "@/shared/ui/photo-tile"
import { RegionCardCarousel } from "@/shared/ui/region-card-carousel"

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string
// mapId 미발급 시 Google이 제공하는 프로토타이핑용 데모 ID로 대체 (AdvancedMarker는 mapId 필수)
const GOOGLE_MAP_ID =
  (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined) ||
  "DEMO_MAP_ID"

// 중심을 북서쪽에 둬서 화면상 대한민국이 우측·하단에 놓이게 한다
const KOREA_VIEW = { lat: 36.55, lng: 127.2, zoom: 6.7 }
const ACCENT = "#6cbcf9" // brand blue (--color-blue-500)
const DASH_DARK = "#232936"
const BOUNDARY_ZOOM = 7.5
const ZOOM_COLOR = 8.5
const PARTY_ZOOM = 9.5
// 관성 줌이 maxZoom 직전(9.4999…)에서 멈춰도 3단계로 인정하는 여유치 (MapLibre 구현과 동일)
const PARTY_ZOOM_EPSILON = 0.01
const PARTY_ENTER = PARTY_ZOOM - PARTY_ZOOM_EPSILON
// 지역 상세 갤러리 패널의 지도 뷰 노출 높이 — GalleryPanel PEEK_VISIBLE와 동일 값
const GALLERY_PEEK = 244
// 사진 핀 기본 크기 — 줌 레벨과 무관하게 항상 고정 (Figma 1319-13186 #1)
const PHOTO_PIN_SIZE = 60

type Centroid = { name: string; lng: number; lat: number }

type PartySlot = {
  region: string
  lat: number
  lng: number
  memberId: string
  nickname: string
  photo: { thumbnailUrl: string } | null
  isMe: boolean
  slotIndex: number
  totalSlots: number
}

function getZoomStage(zoom: number): 0 | 1 | 2 | 3 {
  if (zoom >= PARTY_ENTER) return 3
  if (zoom >= ZOOM_COLOR) return 2
  if (zoom >= BOUNDARY_ZOOM) return 1
  return 0
}

// 지도 center를 화면 아래쪽 dyPx만큼 이동했을 때의 위도 — 지역이 dyPx만큼 위로 보이게 함.
// panBy는 호출 시점 줌의 투영을 쓰므로 setZoom과 함께 쓰면 어긋남 → 목표 줌 기준으로 직접 계산
function offsetLatByPixels(lat: number, dyPx: number, zoom: number): number {
  const worldY =
    (0.5 -
      Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) / (2 * Math.PI)) *
    256
  const newWorldY = worldY + dyPx / 2 ** zoom
  return (
    ((2 * Math.atan(Math.exp((0.5 - newWorldY / 256) * 2 * Math.PI)) -
      Math.PI / 2) *
      180) /
    Math.PI
  )
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
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

const SLOT_SIZE_2X = 80

export type TravelMapImplProps = {
  onRegionDetailChange?: (region: string | null) => void
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
  selectedRegion,
  setSelectedRegion,
  decorating,
  decoratePreview,
  startDecorate,
  flyToRegion,
  flyingRef,
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
  selectedRegion: string | null
  setSelectedRegion: (name: string | null) => void
  decorating: string | null
  decoratePreview: DecoratePreview | null
  startDecorate: (region: string) => void
  flyToRegion: (c: Centroid) => void
  /** flyToRegion으로 프로그래밍 이동 중엔 idle의 "최근접 지역 자동 선택"을 건너뛴다 */
  flyingRef: React.MutableRefObject<boolean>
  setZoomStage: (stage: 0 | 1 | 2 | 3) => void
  setCentroids: (c: Array<Centroid>) => void
  setViewportCentroids: (c: Array<Centroid>) => void
  centroidsRef: React.MutableRefObject<Array<Centroid>>
  onFeatureClick: (name: string) => void
}) {
  const map = useMap()
  const featureClickedRef = React.useRef(false)
  const decoratingRef = React.useRef<string | null>(decorating)
  decoratingRef.current = decorating
  // idle 리스너가 등록 시점 클로저가 아닌 최신 선택 상태로 판정하도록 ref 경유
  const selectedRegionRef = React.useRef<string | null>(selectedRegion)
  selectedRegionRef.current = selectedRegion
  const photoRegionSetRef = React.useRef(photoRegionSet)
  photoRegionSetRef.current = photoRegionSet
  const prevDecoratingRef = React.useRef<string | null>(null)

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
    const domCleanups: Array<() => void> = []
    let dataLayer: RegionDataLayer | null = null
    let overlay: ImageFillOverlay | null = null

    loadKoreaGeoJson()
      .then((geojson) => {
        if (cancelled) return
        geojsonRef.current = geojson

        dataLayer = createRegionDataLayer(map, geojson, {
          accent: ACCENT,
          initialZoom: map.getZoom() ?? KOREA_VIEW.zoom,
          onFeatureClick: (name) => {
            featureClickedRef.current = true
            if (decoratingRef.current) return
            // 초기 줌(경계선·지역명 미노출)에서는 지역 클릭으로 이동/등록하지 않음
            if ((map.getZoom() ?? 0) < BOUNDARY_ZOOM) return
            // 안 가본 지역(색칠·사진 없음)은 줌인 대신 첫 여행 등록 플로우로 진입
            if (
              !Object.hasOwn(fillsRef.current, name) &&
              !photoRegionSetRef.current.has(name)
            ) {
              startDecorate(name)
              return
            }
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

        const computed: Array<Centroid> = []
        for (const f of geojson.features) {
          const name = f.properties?.name as string | undefined
          if (!name) continue
          const center = computeCentroid(f)
          if (center) computed.push({ name, lng: center[0], lat: center[1] })
        }
        centroidsRef.current = computed
        setCentroids(computed)

        dataLayer.sync({
          fills: fillsRef.current,
          hasPhotoRegions: photoRegionSetRef.current,
        })

        // 배경(지역 밖) 클릭 시 선택 해제 — Data feature 클릭과 겹치면 스킵
        listeners.push(
          map.addListener("click", () => {
            if (featureClickedRef.current) {
              featureClickedRef.current = false
              return
            }
            if (decoratingRef.current) return
            // 핀 클릭으로 비행 중일 땐 지연 도착한 맵 클릭이 방금 선택을 지우지 않게
            if (flyingRef.current) return
            if ((map.getZoom() ?? 0) < PARTY_ENTER) setSelectedRegion(null)
          })
        )

        // 사용자 제스처가 시작되면 비행 잠금 해제 — 이후 idle부터 자동 선택 재개
        const mapDiv = map.getDiv()
        const unlockFlight = () => {
          flyingRef.current = false
        }
        mapDiv.addEventListener("pointerdown", unlockFlight)
        mapDiv.addEventListener("wheel", unlockFlight)
        domCleanups.push(() => {
          mapDiv.removeEventListener("pointerdown", unlockFlight)
          mapDiv.removeEventListener("wheel", unlockFlight)
        })

        const syncViewport = () => {
          const bounds = map.getBounds()
          if (!bounds) return
          setViewportCentroids(
            centroidsRef.current.filter(({ lng, lat }) =>
              bounds.contains({ lat, lng })
            )
          )
        }

        listeners.push(
          map.addListener("zoom_changed", () => {
            const zoom = map.getZoom() ?? KOREA_VIEW.zoom
            setZoomStage(getZoomStage(zoom))
            dataLayer?.syncZoom(zoom)
          })
        )
        listeners.push(
          map.addListener("idle", () => {
            syncViewport()
            overlay?.draw()

            // 최대 줌에서 화면 중앙과 가장 가까운 지역을 자동 선택 (MapLibre onMove 포팅)
            // Google은 move 이벤트가 idle에서만 안정되므로 제스처 종료 시점에 판정한다.
            // flyToRegion으로 방금 이동한 직후의 idle이면 건너뛴다 — 안 그러면 우리가
            // 방금 선택한 지역을 이 재계산이 즉시 덮어써 파티 UI가 깜빡이며 사라진다
            if (decoratingRef.current || flyingRef.current) return
            const zoom = map.getZoom() ?? 0
            const center = map.getCenter()
            if (
              zoom >= PARTY_ENTER &&
              center &&
              centroidsRef.current.length > 0
            ) {
              const lng = center.lng()
              const lat = center.lat()
              let nearest = centroidsRef.current[0]
              let minDist = Infinity
              for (const c of centroidsRef.current) {
                const d = (c.lng - lng) ** 2 + (c.lat - lat) ** 2
                if (d < minDist) {
                  minDist = d
                  nearest = c
                }
              }
              if (nearest.name !== selectedRegionRef.current) {
                // 안 가본 지역(색칠·사진 없음)은 상세 진입 대신 "+" 버튼 노출 유지
                const visited =
                  Object.hasOwn(fillsRef.current, nearest.name) ||
                  photoRegionSetRef.current.has(nearest.name)
                setSelectedRegion(visited ? nearest.name : null)
              }
            } else if (
              zoom < PARTY_ENTER &&
              selectedRegionRef.current !== null
            ) {
              setSelectedRegion(null)
            }
          })
        )
        // 초기 줌 스테이지·뷰포트 반영
        setZoomStage(getZoomStage(map.getZoom() ?? KOREA_VIEW.zoom))
        syncViewport()
      })
      .catch(console.error)

    return () => {
      cancelled = true
      for (const l of listeners) l.remove()
      for (const c of domCleanups) c()
      dataLayer?.destroy()
      overlay?.setMap(null)
      if (dataLayerRef.current === dataLayer) dataLayerRef.current = null
      if (overlayRef.current === overlay) overlayRef.current = null
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
    startDecorate,
    setCentroids,
    setSelectedRegion,
    setViewportCentroids,
    setZoomStage,
  ])

  // fills/hasPhoto 변경 반영 + 이미지 fill 다시 로드
  React.useEffect(() => {
    const dataLayer = dataLayerRef.current
    const overlay = overlayRef.current
    if (!dataLayer) return
    dataLayer.sync({ fills, hasPhotoRegions: photoRegionSet })
    overlay?.loadPendingImages(() => overlay.draw())
    overlay?.draw()
  }, [fills, photoRegionSet, dataLayerRef, overlayRef])

  // active(선택 지역) 동기화
  React.useEffect(() => {
    dataLayerRef.current?.sync({ activeRegion: selectedRegion })
  }, [selectedRegion, dataLayerRef])

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
    const prevDecorating = prevDecoratingRef.current
    prevDecoratingRef.current = decorating
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

      // 업로드 커밋으로 플로우가 끝났다면(사진 생김) 지역 상세로 복귀 (Figma 1340-18364)
      if (prevDecorating && photoRegionSetRef.current.has(prevDecorating)) {
        setSelectedRegion(prevDecorating)
        const c = centroidsRef.current.find((x) => x.name === prevDecorating)
        if (c) flyToRegion(c)
      }
    }
  }, [
    decorating,
    map,
    dataLayerRef,
    geojsonRef,
    centroidsRef,
    setSelectedRegion,
    flyToRegion,
  ])

  return null
}

// 아직 꾸미기 이력이 없는 팟의 안정 참조 — 셀렉터가 매번 새 객체를 만들지 않도록
const EMPTY_FILLS: Record<string, RegionFill> = {}

function TravelMapGoogleInner({ onRegionDetailChange }: TravelMapImplProps) {
  const currentPotId = usePotStore((s) => s.currentPotId)
  const photos = useAllPhotos(currentPotId)
  const fills = useRegionColorStore(
    (s) => s.fillsByPot[currentPotId] ?? EMPTY_FILLS
  )
  const partyMembers = usePotStore(selectCurrentPotMembers)
  const currentUser = useSessionStore((s) => s.currentUser)
  const currentUserId = currentUser?.id ?? null
  const addPhoto = usePhotoUploadStore((s) => s.addPhoto)

  const mapRef = React.useRef<google.maps.Map | null>(null)
  const geojsonRef = React.useRef<GeoJSON.FeatureCollection | null>(null)
  const dataLayerRef = React.useRef<RegionDataLayer | null>(null)
  const overlayRef = React.useRef<ImageFillOverlay | null>(null)
  const centroidsRef = React.useRef<Array<Centroid>>([])
  // flyToRegion 등 프로그래밍 이동 후 idle의 "최근접 지역 자동 선택"과 배경 클릭
  // 해제가 방금 선택을 덮어쓰지 않도록 잠금. 도착(idle)·타임아웃 시점에 풀면
  // 도착 직후 늦게 오는 idle/지연 클릭이 선택을 풀어버려 상세 진입이 튕긴다 —
  // 사용자 제스처(pointerdown/wheel) 시점에만 해제한다
  const flyingRef = React.useRef(false)
  const cameraRafRef = React.useRef<number | null>(null)
  React.useEffect(() => {
    return () => {
      if (cameraRafRef.current !== null)
        cancelAnimationFrame(cameraRafRef.current)
    }
  }, [])
  // 오버레이 draw()가 항상 최신 fills를 보도록 동기화 (MapLibre 구현의 fillsRef와 동일)
  const fillsRef = React.useRef(fills)
  React.useEffect(() => {
    fillsRef.current = fills
  }, [fills])

  const [zoomStage, setZoomStage] = React.useState<0 | 1 | 2 | 3>(() =>
    getZoomStage(KOREA_VIEW.zoom)
  )
  const [centroids, setCentroids] = React.useState<Array<Centroid>>([])
  const [viewportCentroids, setViewportCentroids] = React.useState<
    Array<Centroid>
  >([])
  const [selectedRegion, setSelectedRegion] = React.useState<string | null>(
    null
  )
  const [galleryExpanded, setGalleryExpanded] = React.useState(false)

  const decorating = useDecorateStore((s) => s.region)
  const decoratePreview = useDecorateStore((s) => s.preview)
  const startDecorate = useDecorateStore((s) => s.start)

  const centroidMap = React.useMemo(
    () => new Map(centroids.map((c) => [c.name, c])),
    [centroids]
  )

  const photoRegionSet = React.useMemo(
    () => new Set(photos.map((p) => p.region)),
    [photos]
  )

  const detailRegion =
    !decorating && zoomStage === 3 && selectedRegion ? selectedRegion : null

  React.useEffect(() => {
    onRegionDetailChange?.(detailRegion)
  }, [detailRegion, onRegionDetailChange])

  React.useEffect(() => {
    setGalleryExpanded(false)
  }, [detailRegion])

  // flyToRegion/handleBackToHome 공용 — 잠금 세팅 + 이동 애니메이션.
  // 잠금 해제는 사용자 제스처(MapController의 pointerdown/wheel 리스너)에서만 한다
  const runCameraMove = React.useCallback(
    (target: { lat: number; lng: number; zoom: number }, duration: number) => {
      const map = mapRef.current
      if (!map) return
      flyingRef.current = true
      animateCamera(map, target, duration, cameraRafRef)
    },
    []
  )

  const flyToRegion = React.useCallback(
    (c: Centroid) => {
      // panBy는 호출 시점(줌 애니메이션 전) 투영 기준이라 오프셋이 어긋남 —
      // 목표 줌의 mercator 좌표에서 직접 보정한 center로 이동 (MapLibre flyTo duration 350ms와 동일)
      runCameraMove(
        {
          lat: offsetLatByPixels(c.lat, GALLERY_PEEK / 2, PARTY_ZOOM),
          lng: c.lng,
          zoom: PARTY_ZOOM,
        },
        350
      )
    },
    [runCameraMove]
  )

  const handleBackToHome = React.useCallback(() => {
    setSelectedRegion(null)
    // MapLibre handleBackToHome duration 600ms와 동일
    runCameraMove(
      { lat: KOREA_VIEW.lat, lng: KOREA_VIEW.lng, zoom: KOREA_VIEW.zoom },
      600
    )
  }, [runCameraMove])

  const handleCarouselSelect = React.useCallback(
    (region: string) => {
      const center =
        centroidMap.get(region) ??
        (Object.hasOwn(REGION_CENTERS, region)
          ? REGION_CENTERS[region]
          : undefined)
      if (!center) return
      setSelectedRegion(region)
      flyToRegion({ name: region, lng: center.lng, lat: center.lat })
    },
    [centroidMap, flyToRegion]
  )

  const handleFeatureClick = React.useCallback(
    (name: string) => {
      setSelectedRegion(name)
      const c = centroidsRef.current.find((x) => x.name === name)
      if (c) flyToRegion(c)
    },
    [flyToRegion]
  )

  // 지역당 최신 사진 1개, centroid 위치 고정 — 사진 개수·크기는 줌 레벨과 무관
  const visiblePins = React.useMemo(() => {
    const byRegion = new Map<string, (typeof photos)[number]>()
    for (const p of photos) {
      const existing = byRegion.get(p.region)
      if (!existing || p.date > existing.date) byRegion.set(p.region, p)
    }
    return [...byRegion.values()].map((p) => {
      const c = centroidMap.get(p.region)
      return { ...p, pinLat: c?.lat ?? p.lat, pinLng: c?.lng ?? p.lng }
    })
  }, [photos, centroidMap])

  const partySlots = React.useMemo<Array<PartySlot>>(() => {
    if (!selectedRegion || partyMembers.length === 0) return []
    const c = centroidMap.get(selectedRegion)
    if (!c) return []
    // 갤러리 최신 날짜 행과 동일 기준 — 가장 최근 여행 일자에 올린 사진만 슬롯에 매칭
    const regionPhotos = photos.filter((p) => p.region === selectedRegion)
    const latestDate = regionPhotos.reduce<string | null>(
      (acc, p) => (acc === null || p.date > acc ? p.date : acc),
      null
    )
    const photoByUser = new Map<string, (typeof photos)[number]>()
    for (const p of regionPhotos) {
      if (p.date === latestDate) photoByUser.set(p.uploaderId, p)
    }
    // 내 슬롯이 배치의 마지막 자리(우하단)에 오도록 정렬
    const ordered = [...partyMembers].sort(
      (a, b) => Number(a.id === currentUserId) - Number(b.id === currentUserId)
    )
    const total = ordered.length
    return ordered.map((member, i) => {
      const photo = photoByUser.get(member.id) ?? null
      const isMe = member.id === currentUserId
      return {
        region: selectedRegion,
        lat: c.lat,
        lng: c.lng,
        memberId: member.id,
        // 내 슬롯은 목 멤버 닉네임 대신 로그인한 세션 닉네임 노출
        nickname: isMe
          ? (currentUser?.nickname ?? member.nickname)
          : member.nickname,
        photo: photo ? { thumbnailUrl: photo.thumbnailUrl } : null,
        isMe,
        slotIndex: i,
        totalSlots: total,
      }
    })
  }, [
    selectedRegion,
    partyMembers,
    photos,
    centroidMap,
    currentUser,
    currentUserId,
  ])

  return (
    <div className="relative size-full">
      <GoogleMap
        mapId={GOOGLE_MAP_ID}
        defaultCenter={{ lat: KOREA_VIEW.lat, lng: KOREA_VIEW.lng }}
        defaultZoom={KOREA_VIEW.zoom}
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
          fills={fills}
          fillsRef={fillsRef}
          photoRegionSet={photoRegionSet}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          decorating={decorating}
          decoratePreview={decoratePreview}
          startDecorate={startDecorate}
          flyToRegion={flyToRegion}
          flyingRef={flyingRef}
          setZoomStage={setZoomStage}
          setCentroids={setCentroids}
          setViewportCentroids={setViewportCentroids}
          centroidsRef={centroidsRef}
          onFeatureClick={handleFeatureClick}
        />

        {zoomStage >= 1 &&
          !selectedRegion &&
          !decorating &&
          viewportCentroids
            // 줌 2단계(zoomStage 1)는 관광지 상위 30%만, 줌 3단계(zoomStage 2+)는 전부 노출
            .filter(
              ({ name }) =>
                !Object.hasOwn(fills, name) &&
                !photoRegionSet.has(name) &&
                (zoomStage >= 2 || POPULAR_REGIONS.has(name))
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

        {/* selectedRegion이 아니라 detailRegion 기준 — 핀 클릭 직후 카메라 비행 중에도
            핀을 유지해 빈 지도가 보이지 않게 하고, 도착 시점에 슬롯과 교체한다 */}
        {!detailRegion &&
          !decorating &&
          visiblePins.map((p) => (
            <AdvancedMarker
              key={`photo-${p.id}`}
              position={{ lat: p.pinLat, lng: p.pinLng }}
              anchorPoint={AdvancedMarkerAnchorPoint.BOTTOM}
              clickable
            >
              <PhotoTile
                label={formatRegionName(p.region)}
                imageUrl={p.thumbnailUrl}
                size={PHOTO_PIN_SIZE}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedRegion(p.region)
                  const c = centroidMap.get(p.region)
                  if (c) flyToRegion(c)
                }}
              />
            </AdvancedMarker>
          ))}

        {/* 비행 도중 미리 뜨지 않도록 도착(지역 상세) 시점에 갤러리 패널과 함께 등장 */}
        {detailRegion &&
          partySlots.map((slot) => {
            const offset = partySlotOffset(slot.totalSlots, slot.slotIndex)
            const slotPhoto = slot.photo
            return (
              <AdvancedMarker
                key={`slot-${slot.region}-${slot.memberId}`}
                position={{ lat: slot.lat, lng: slot.lng }}
                anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
                clickable
              >
                <div
                  style={{
                    transform: `translate(${offset[0]}px, ${offset[1]}px)`,
                  }}
                >
                  {slotPhoto ? (
                    <PhotoTile
                      label={slot.nickname}
                      imageUrl={slotPhoto.thumbnailUrl}
                      size={SLOT_SIZE_2X}
                      onClick={(e) => {
                        e.stopPropagation()
                        openPhotoViewer(slotPhoto.thumbnailUrl)
                      }}
                    />
                  ) : (
                    // 빈 슬롯도 PhotoTile과 동일한 닉네임 칩 노출 (칩 + 타일 세로 배치)
                    <div className="flex flex-col items-center gap-1">
                      <span className="rounded-full bg-bg-neutral-weak px-3 py-1 text-h9 text-fg-neutral-bold shadow-[0px_0px_10px_rgba(142,150,169,0.12)]">
                        {slot.nickname}
                      </span>
                      {slot.isMe ? (
                        <button
                          type="button"
                          aria-label="내 사진 등록"
                          onClick={(e) => {
                            e.stopPropagation()
                            pickImageFile((url) => {
                              if (!currentUserId) return
                              // 팟원들이 올린 이 지역 사진의 최신 날짜에 합류, 없으면 오늘
                              const latestDate = photos
                                .filter((p) => p.region === slot.region)
                                .reduce<
                                  string | null
                                >((acc, p) => (acc === null || p.date > acc ? p.date : acc), null)
                              addPhoto({
                                id: `uploaded-${Date.now()}`,
                                lat: slot.lat,
                                lng: slot.lng,
                                thumbnailUrl: url,
                                date: latestDate ?? toISODate(new Date()),
                                uploaderId: currentUserId,
                                region: slot.region,
                                potId: currentPotId,
                              })
                              // 갤러리 패널(하단 244px 노출) 위로 띄워 겹치지 않게
                              showToast({
                                message: "업로드가 완료됐어요",
                                icon: "check",
                                className: "bottom-[256px]",
                              })
                            })
                          }}
                          className="flex items-center justify-center rounded-2xl border-2 border-dashed border-primary/50 bg-white transition-colors hover:border-primary hover:bg-primary/5"
                          style={{ width: SLOT_SIZE_2X, height: SLOT_SIZE_2X }}
                        >
                          <Plus className="size-6 text-primary/60" />
                        </button>
                      ) : (
                        <div
                          className="flex items-center justify-center rounded-2xl border-2 border-dashed border-foreground/20 bg-white"
                          style={{ width: SLOT_SIZE_2X, height: SLOT_SIZE_2X }}
                        >
                          <img
                            src="/icon-zzz.svg"
                            alt="사진 없음"
                            className="size-9 opacity-70"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </AdvancedMarker>
            )
          })}
      </GoogleMap>

      {detailRegion && !galleryExpanded ? (
        <div className="absolute inset-x-0 top-0 z-10 pt-[env(safe-area-inset-top)]">
          <div className="flex h-[76px] items-center justify-between px-4 py-2">
            <ButtonIcon aria-label="뒤로 가기" onClick={handleBackToHome}>
              <img src={iconArrowLeftSrc} alt="" className="size-6" />
            </ButtonIcon>
            <span className="text-h3 text-fg-neutral-bold">
              {formatRegionName(detailRegion)}
            </span>
          </div>
        </div>
      ) : null}

      {detailRegion ? (
        <GalleryPanel
          key={detailRegion}
          region={detailRegion}
          expanded={galleryExpanded}
          onExpandedChange={setGalleryExpanded}
        />
      ) : null}

      <RegionCardCarousel
        photos={photos}
        visible={zoomStage === 0 && !decorating}
        onSelectRegion={handleCarouselSelect}
      />

      {decorating && centroidMap.get(decorating) ? (
        <RegionDecorateFlow
          region={decorating}
          center={{
            lat: centroidMap.get(decorating)!.lat,
            lng: centroidMap.get(decorating)!.lng,
          }}
        />
      ) : null}
    </div>
  )
}
