import "maplibre-gl/dist/maplibre-gl.css"
import * as React from "react"
import { Map as MapGL, Marker } from "react-map-gl/maplibre"
import { feature as toFeature, merge as toMerge } from "topojson-client"
import { Plus } from "lucide-react"
import { POPULAR_REGIONS } from "../model/popular-regions"
import { RegionCardCarousel } from "./RegionCardCarousel"
import { useRegionHighlight } from "./useRegionHighlight"
import type { MapRef } from "react-map-gl/maplibre"
import type { Map as MapLibreMap } from "maplibre-gl"
import type { Topology } from "topojson-specification"

import type { RegionFill } from "@/entities/region"
import {
  REGION_CENTERS,
  useAllPhotos,
  usePhotoUploadStore,
} from "@/entities/photo"
import { formatRegionName, useRegionColorStore } from "@/entities/region"
import { usePotStore } from "@/entities/travel-pot"
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

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY as string
const MAP_STYLE = `https://api.maptiler.com/maps/019f1dec-144a-7e9c-9ab5-4398b89987f9/style.json?key=${MAPTILER_KEY}`
const KOREA_VIEW = { longitude: 127.8, latitude: 36.2, zoom: 6.5 }
const MUNICIPALITIES_URL =
  "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-municipalities-2018-topo-simple.json"
const PROVINCES_URL =
  "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-provinces-2018-topo-simple.json"
const METRO_CITIES = new Set([
  "서울특별시",
  "부산광역시",
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "세종특별자치시",
])

const ACCENT = "#6cbcf9" // brand blue (--color-blue-500)

const MUNI_SRC = "municipalities"
const MUNI_FILL = "municipality-fill"
const MUNI_LINE = "municipality-line"
const MUNI_DASH = "municipality-dash" // 첫 여행 등록 플로우의 강조선
// 등록 플로우 강조선 — 색상 미선택 시 다크, 선택 시 해당 색 500 (Figma 1319-16850)
const DASH_DARK = "#232936" // --color-neutral-800
const BOUNDARY_ZOOM = 7.5 // 경계선 + "+" 버튼 등장
const ZOOM_COLOR = 8.5 // 2개 핀 + 72px 사이즈
const PARTY_ZOOM = 9.5 // 파티 슬롯 자동 노출 임계점 = 맵 최대 줌
// 관성 줌이 maxZoom 직전(9.4999…)에서 멈춰도 3단계로 인정하는 여유치
const PARTY_ZOOM_EPSILON = 0.01
const PARTY_ENTER = PARTY_ZOOM - PARTY_ZOOM_EPSILON

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

// 폴리곤 면적 가중 centroid (shoelace) — bbox 중심과 달리 오목한 해안선에서도 도형 내부에 안착
function ringCentroid(
  ring: Array<Array<number>>
): { center: [number, number]; area: number } | null {
  let area = 0
  let cx = 0
  let cy = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const [x0, y0] = ring[i]
    const [x1, y1] = ring[i + 1]
    const cross = x0 * y1 - x1 * y0
    area += cross
    cx += (x0 + x1) * cross
    cy += (y0 + y1) * cross
  }
  area /= 2
  if (area === 0) return null
  return { center: [cx / (6 * area), cy / (6 * area)], area: Math.abs(area) }
}

function computeCentroid(feature: GeoJSON.Feature): [number, number] | null {
  const g = feature.geometry
  let rings: Array<Array<Array<number>>> = []
  if (g.type === "Polygon") rings = [g.coordinates[0]]
  else if (g.type === "MultiPolygon") rings = g.coordinates.map((p) => p[0])
  else return null

  if (rings.length === 0) return null

  const computed = rings.map(ringCentroid).filter((r) => r !== null)
  if (computed.length === 0) return null

  // 가장 큰 폴리곤(본토) 기준
  const largest = computed.reduce((a, b) => (a.area >= b.area ? a : b))
  return largest.center
}

function addLayers(
  map: MapLibreMap,
  srcId: string,
  fillId: string,
  lineId: string,
  data: GeoJSON.FeatureCollection
): boolean {
  if (map.getSource(srcId)) return false
  map.addSource(srcId, { type: "geojson", data, generateId: true })
  const firstSymbolId = map
    .getStyle()
    .layers.find((l) => l.type === "symbol")?.id
  const isActive: maplibregl.ExpressionSpecification = [
    "boolean",
    ["feature-state", "active"],
    false,
  ]
  const hasColor: maplibregl.ExpressionSpecification = [
    "boolean",
    ["feature-state", "hasColor"],
    false,
  ]
  const hasPhoto: maplibregl.ExpressionSpecification = [
    "boolean",
    ["feature-state", "hasPhoto"],
    false,
  ]

  map.addLayer(
    {
      id: fillId,
      type: "fill",
      source: srcId,
      paint: {
        "fill-color": [
          "coalesce",
          ["feature-state", "color"] as maplibregl.ExpressionSpecification,
          ACCENT,
        ],
        "fill-opacity": [
          "case",
          isActive,
          0.15,
          // 100 컬러의 60% = primitive {color}-100-alpha (Figma 1319-16850)
          hasColor,
          0.6,
          hasPhoto,
          0.08,
          0,
        ],
      },
    },
    firstSymbolId
  )
  map.addLayer(
    {
      id: lineId,
      type: "line",
      source: srcId,
      minzoom: BOUNDARY_ZOOM,
      paint: {
        "line-color": ["case", isActive, ACCENT, "#aaaaaa"],
        "line-width": ["case", isActive, 2.5, 0.9],
        "line-opacity": ["case", isActive, 1, 0.65],
      },
    },
    firstSymbolId
  )
  // 첫 여행 등록 플로우 강조선(실선) — 평소엔 아무 지역도 매칭하지 않음
  map.addLayer({
    id: MUNI_DASH,
    type: "line",
    source: srcId,
    filter: ["==", ["get", "name"], "__none__"],
    paint: {
      "line-color": DASH_DARK,
      "line-width": 2,
    },
  })
  return true
}

// 지역 폴리곤 전체 bbox — 등록 플로우 진입 시 fitBounds용
function computeFeatureBBox(
  feature: GeoJSON.Feature
): [[number, number], [number, number]] | null {
  const g = feature.geometry
  let rings: Array<Array<Array<number>>> = []
  if (g.type === "Polygon") rings = g.coordinates
  else if (g.type === "MultiPolygon") rings = g.coordinates.flat()
  else return null
  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity
  for (const ring of rings) {
    for (const [lng, lat] of ring) {
      if (lng < minLng) minLng = lng
      if (lng > maxLng) maxLng = lng
      if (lat < minLat) minLat = lat
      if (lat > maxLat) maxLat = lat
    }
  }
  if (minLng === Infinity) return null
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ]
}

const MAP_INTERACTIONS = [
  "dragPan",
  "scrollZoom",
  "doubleClickZoom",
  "touchZoomRotate",
  "keyboard",
  "dragRotate",
] as const

const SLOT_SIZE_2X = 80

// 지역 상세 갤러리 패널의 지도 뷰 노출 높이 — GalleryPanel PEEK_VISIBLE와 동일 값
const GALLERY_PEEK = 244

// 사진 핀 기본 크기 — 줌 레벨과 무관하게 항상 고정 (Figma 1319-13186 #1)
const PHOTO_PIN_SIZE = 60

// 0: 초기 / 1: 경계선+"+" / 2: 색상+72px 핀 / 3: 파티 슬롯(최대 줌)
function getZoomStage(zoom: number): 0 | 1 | 2 | 3 {
  if (zoom >= PARTY_ENTER) return 3
  if (zoom >= ZOOM_COLOR) return 2
  if (zoom >= BOUNDARY_ZOOM) return 1
  return 0
}

type PhotoTileProps = {
  label: string
  imageUrl: string
  size: number
  onClick: (e: React.MouseEvent) => void
}

// 사진 핀 / 파티 슬롯 공용 타일 — 닉네임/지역명 칩 + 정사각 이미지
function PhotoTile({ label, imageUrl, size, onClick }: PhotoTileProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="group flex flex-col items-center gap-1"
    >
      <span className="rounded-full bg-bg-neutral-weak px-3 py-1 text-h9 text-fg-neutral-bold shadow-[0px_0px_10px_rgba(142,150,169,0.12)]">
        {label}
      </span>
      <span
        className="block overflow-hidden rounded-2xl border-2 border-stroke-neutral-inverse shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)] transition-all group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        <img src={imageUrl} alt="" className="size-full object-cover" />
      </span>
    </button>
  )
}

export type TravelMapImplProps = {
  /** 지역 상세(최대 줌) 진입/이탈 알림 — 페이지 헤더 전환용 */
  onRegionDetailChange?: (region: string | null) => void
}

// 아직 꾸미기 이력이 없는 팟의 안정 참조 — 셀렉터가 매번 새 객체를 만들지 않도록
const EMPTY_FILLS: Record<string, RegionFill> = {}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function TravelMapImpl({ onRegionDetailChange }: TravelMapImplProps) {
  const currentPotId = usePotStore((s) => s.currentPotId)
  const photos = useAllPhotos(currentPotId)
  const fills = useRegionColorStore(
    (s) => s.fillsByPot[currentPotId] ?? EMPTY_FILLS
  )
  const partyMembers = usePotStore(
    (s) => s.pots.find((p) => p.id === s.currentPotId)?.members ?? []
  )
  const currentUser = useSessionStore((s) => s.currentUser)
  const currentUserId = currentUser?.id ?? null
  const addPhoto = usePhotoUploadStore((s) => s.addPhoto)
  const mapRef = React.useRef<MapRef>(null)
  const mapInstanceRef = React.useRef<MapLibreMap | null>(null)
  const geojsonRef = React.useRef<GeoJSON.FeatureCollection | null>(null)
  const photoRegionsRef = React.useRef<Set<string>>(new Set())
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const imgCacheRef = React.useRef(new Map<string, HTMLImageElement>())
  const fillsRef = React.useRef(fills)
  const [zoomStage, setZoomStage] = React.useState(() =>
    getZoomStage(KOREA_VIEW.zoom)
  )
  // 레이어 준비 완료 신호 — 영속 복원된 fills를 지도 로드 후 반영하기 위한 effect 트리거
  const [mapReady, setMapReady] = React.useState(false)
  const [centroids, setCentroids] = React.useState<Array<Centroid>>([])
  const [viewportCentroids, setViewportCentroids] = React.useState<
    Array<Centroid>
  >([])
  const [selectedRegion, setSelectedRegion] = React.useState<string | null>(
    null
  )
  // 지역 상세 갤러리 패널 — true면 리스트 뷰(top 54)로 확장
  const [galleryExpanded, setGalleryExpanded] = React.useState(false)
  // 첫 여행 등록 플로우 — 진행 중인 지역명 (null이면 일반 모드)
  const decorating = useDecorateStore((s) => s.region)
  const decoratePreview = useDecorateStore((s) => s.preview)
  const startDecorate = useDecorateStore((s) => s.start)
  const decoratingRef = React.useRef<string | null>(null)
  const flyingRef = React.useRef(false)
  const flyingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const initedRef = React.useRef(false)
  const rafRef = React.useRef<number | null>(null)
  const moveRafRef = React.useRef<number | null>(null)
  const latestViewStateRef = React.useRef<{
    zoom: number
    longitude: number
    latitude: number
  } | null>(null)
  const { setupClickHandler, setActiveByName, buildNameIndex, nameToIdRef } =
    useRegionHighlight()

  const centroidMap = React.useMemo(
    () => new Map(centroids.map((c) => [c.name, c])),
    [centroids]
  )

  // 지역 상세 상태 — 최대 줌 + 지역 선택 (등록 플로우 제외)
  const detailRegion =
    !decorating && zoomStage === 3 && selectedRegion ? selectedRegion : null

  React.useEffect(() => {
    onRegionDetailChange?.(detailRegion)
  }, [detailRegion, onRegionDetailChange])

  // 지역 상세를 벗어나거나 다른 지역으로 이동하면 패널을 지도 뷰로 복귀
  React.useEffect(() => {
    setGalleryExpanded(false)
  }, [detailRegion])

  // 뒤로가기 — 선택 해제 후 메인 홈 지도(초기 뷰)로 줌아웃
  const handleBackToHome = React.useCallback(() => {
    setSelectedRegion(null)
    mapInstanceRef.current?.flyTo({
      center: [KOREA_VIEW.longitude, KOREA_VIEW.latitude],
      zoom: KOREA_VIEW.zoom,
      duration: 600,
    })
  }, [])

  // 사진이 하나라도 있는 지역 — 첫 여행 등록("+")이 이미 끝난 곳
  const photoRegionSet = React.useMemo(
    () => new Set(photos.map((p) => p.region)),
    [photos]
  )

  const updateViewportCentroids = React.useCallback(
    (allCentroids: Array<Centroid>) => {
      const map = mapInstanceRef.current
      if (!map) return
      const bounds = map.getBounds()
      setViewportCentroids(
        allCentroids.filter(({ lng, lat }) => bounds.contains([lng, lat]))
      )
    },
    []
  )

  // 지역 선택 시 flyTo로 이동 + moveend 대기, 카메라가 이미 목표 위치면 moveend가
  // 발생하지 않을 수 있어 타임아웃으로 flyingRef를 강제 해제
  const flyToRegion = React.useCallback((map: MapLibreMap, c: Centroid) => {
    flyingRef.current = true
    if (flyingTimeoutRef.current !== null)
      clearTimeout(flyingTimeoutRef.current)
    flyingTimeoutRef.current = setTimeout(() => {
      flyingRef.current = false
    }, 600)
    // 하단 갤러리 패널을 제외한 가시 영역의 세로 중앙에 지역이 오도록 위로 보정
    map.flyTo({
      center: [c.lng, c.lat],
      zoom: PARTY_ZOOM,
      duration: 350,
      offset: [0, -GALLERY_PEEK / 2],
    })
    map.once("moveend", () => {
      if (flyingTimeoutRef.current !== null)
        clearTimeout(flyingTimeoutRef.current)
      flyingRef.current = false
    })
  }, [])

  // 캐러셀 카드 탭 → 해당 지역으로 지도 이동 (줌인되며 캐러셀은 줌 정책에 따라 사라짐)
  const handleCarouselSelect = React.useCallback(
    (region: string) => {
      const map = mapInstanceRef.current
      if (!map) return
      // Record 인덱싱은 undefined를 숨기므로 존재 확인 후 접근
      const center =
        centroidMap.get(region) ??
        (Object.hasOwn(REGION_CENTERS, region)
          ? REGION_CENTERS[region]
          : undefined)
      if (!center) return
      setSelectedRegion(region)
      flyToRegion(map, { name: region, lng: center.lng, lat: center.lat })
    },
    [centroidMap, flyToRegion]
  )

  React.useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      if (moveRafRef.current !== null) cancelAnimationFrame(moveRafRef.current)
      if (flyingTimeoutRef.current !== null)
        clearTimeout(flyingTimeoutRef.current)
    }
  }, [])

  // keep fillsRef in sync so drawImageFills always sees latest fills
  React.useEffect(() => {
    fillsRef.current = fills
  }, [fills])

  // selectedRegion 변경 시 active feature-state 동기화 (단일 소스)
  React.useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !map.getSource(MUNI_SRC)) return
    setActiveByName(map, MUNI_SRC, selectedRegion)
  }, [selectedRegion, setActiveByName])

  // 등록 플로우 진입/이탈 — 지도 잠금 + 강조선 + 지역 화면 중앙 fit
  React.useEffect(() => {
    const prevDecorating = decoratingRef.current
    decoratingRef.current = decorating
    const map = mapInstanceRef.current
    if (!map || !map.getLayer(MUNI_DASH)) return

    if (decorating) {
      for (const name of MAP_INTERACTIONS) map[name].disable()
      map.setFilter(MUNI_DASH, ["==", ["get", "name"], decorating])

      const feature = geojsonRef.current?.features.find(
        (f) => f.properties?.name === decorating
      )
      const bbox = feature ? computeFeatureBBox(feature) : null
      if (bbox) {
        // 상단 타이틀·하단 패널을 피해 지역이 화면 중앙에 오도록 패딩
        map.fitBounds(bbox, {
          padding: { top: 170, bottom: 330, left: 48, right: 48 },
          maxZoom: PARTY_ZOOM,
          duration: 500,
        })
      }
    } else {
      for (const name of MAP_INTERACTIONS) map[name].enable()
      map.setFilter(MUNI_DASH, ["==", ["get", "name"], "__none__"])

      // 업로드 커밋으로 플로우가 끝났다면(사진 생김) 지역 상세로 복귀 (Figma 1340-18364)
      if (prevDecorating && photoRegionSet.has(prevDecorating)) {
        setSelectedRegion(prevDecorating)
        const c = centroidMap.get(prevDecorating)
        if (c) flyToRegion(map, c)
      }
    }
  }, [decorating, photoRegionSet, centroidMap, flyToRegion])

  // 강조선 색 — 색상 미선택 시 다크, 스와치 탭 즉시 해당 색 500 (Figma 1319-16850)
  React.useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !map.getLayer(MUNI_DASH)) return
    map.setPaintProperty(
      MUNI_DASH,
      "line-color",
      decoratePreview?.stroke ?? DASH_DARK
    )
  }, [decoratePreview])

  // 색상 미리보기 채움 — 스와치 탭 즉시 지역을 100-alpha로 칠하고, 이탈 시 저장값 복원
  React.useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !map.getSource(MUNI_SRC) || !decorating) return
    const id = nameToIdRef.current.get(decorating)
    if (id === undefined) return

    if (decoratePreview) {
      map.setFeatureState(
        { source: MUNI_SRC, id },
        { color: decoratePreview.fill, hasColor: true }
      )
    }
    return () => {
      const stored = fillsRef.current[decorating] as RegionFill | undefined
      if (stored && stored.type === "color") {
        map.setFeatureState(
          { source: MUNI_SRC, id },
          { color: stored.value, hasColor: true }
        )
      } else {
        map.setFeatureState(
          { source: MUNI_SRC, id },
          { color: null, hasColor: false }
        )
      }
    }
  }, [decorating, decoratePreview, mapReady, nameToIdRef])

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
    // (과거 일자 사진까지 채우면 갤러리의 "안 올림" 표시와 어긋난다)
    const regionPhotos = photos.filter((p) => p.region === selectedRegion)
    const latestDate = regionPhotos.reduce<string | null>(
      (acc, p) => (acc === null || p.date > acc ? p.date : acc),
      null
    )
    const photoByUser = new Map<string, (typeof photos)[number]>()
    for (const p of regionPhotos) {
      // 같은 유저·같은 날짜에 여러 장이면 마지막 등록분 노출 (갤러리와 동일)
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

  // draw image fills onto canvas overlay — RAF throttled (max 1 per frame)
  const drawImageFills = React.useCallback(() => {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const canvas = canvasRef.current
      const map = mapInstanceRef.current
      const geojson = geojsonRef.current
      if (!canvas || !map || !geojson) return

      const container = map.getContainer()
      const dpr = window.devicePixelRatio || 1
      canvas.width = container.offsetWidth * dpr
      canvas.height = container.offsetHeight * dpr

      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, container.offsetWidth, container.offsetHeight)

      for (const [region, fill] of Object.entries(fillsRef.current)) {
        if (fill.type !== "image") continue
        const img = imgCacheRef.current.get(fill.imageId)
        if (!img) continue

        const feature = geojson.features.find(
          (f) => f.properties?.name === region
        )
        if (!feature) continue

        const geometry = feature.geometry
        const polys =
          geometry.type === "Polygon"
            ? [geometry.coordinates]
            : (geometry as GeoJSON.MultiPolygon).coordinates

        let minX = Infinity,
          maxX = -Infinity,
          minY = Infinity,
          maxY = -Infinity

        ctx.save()
        ctx.beginPath()
        for (const poly of polys) {
          poly[0].forEach(([lng, lat], i) => {
            const pt = map.project([lng, lat] as [number, number])
            if (i === 0) ctx.moveTo(pt.x, pt.y)
            else ctx.lineTo(pt.x, pt.y)
            minX = Math.min(minX, pt.x)
            maxX = Math.max(maxX, pt.x)
            minY = Math.min(minY, pt.y)
            maxY = Math.max(maxY, pt.y)
          })
          ctx.closePath()
        }
        ctx.clip()

        if (minX < Infinity) {
          const w = maxX - minX
          const h = maxY - minY
          const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight)
          const dw = img.naturalWidth * scale
          const dh = img.naturalHeight * scale
          ctx.globalAlpha = 0.85
          ctx.drawImage(img, minX + (w - dw) / 2, minY + (h - dh) / 2, dw, dh)
        }
        ctx.restore()
      }
    })
  }, [])

  // load images into cache + redraw when fills change
  React.useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !map.getSource(MUNI_SRC)) return

    // sync color fills via feature-state
    for (const [name, id] of nameToIdRef.current) {
      const fill = fills[name] as RegionFill | undefined
      if (!fill || fill.type === "image") {
        map.setFeatureState(
          { source: MUNI_SRC, id },
          { color: null, hasColor: false }
        )
      } else {
        map.setFeatureState(
          { source: MUNI_SRC, id },
          { color: fill.value, hasColor: true }
        )
      }
    }

    // load any new images then redraw
    const promises = Object.values(fills)
      .filter((f) => f.type === "image" && !imgCacheRef.current.has(f.imageId))
      .map(
        (f) =>
          new Promise<void>((resolve) => {
            if (f.type !== "image") return resolve()
            const img = new Image()
            img.onload = () => {
              imgCacheRef.current.set(f.imageId, img)
              resolve()
            }
            img.onerror = () => resolve()
            img.src = f.dataUrl
          })
      )

    Promise.all(promises).then(drawImageFills)
    if (promises.length === 0) drawImageFills()
  }, [fills, mapReady, nameToIdRef, drawImageFills])

  // sync hasPhoto feature-states
  React.useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !map.getSource(MUNI_SRC)) return
    const currentRegions = new Set(photos.map((p) => p.region))
    for (const name of photoRegionsRef.current) {
      if (!currentRegions.has(name)) {
        const id = nameToIdRef.current.get(name)
        if (id !== undefined)
          map.setFeatureState({ source: MUNI_SRC, id }, { hasPhoto: false })
      }
    }
    for (const name of currentRegions) {
      if (!photoRegionsRef.current.has(name)) {
        const id = nameToIdRef.current.get(name)
        if (id !== undefined)
          map.setFeatureState({ source: MUNI_SRC, id }, { hasPhoto: true })
      }
    }
    photoRegionsRef.current = currentRegions
  }, [photos, nameToIdRef])

  const handleMapLoad = React.useCallback(() => {
    const map = mapRef.current?.getMap()
    if (!map || initedRef.current) return
    initedRef.current = true
    mapInstanceRef.current = map

    Promise.all([
      fetch(MUNICIPALITIES_URL).then((r) => r.json()),
      fetch(PROVINCES_URL).then((r) => r.json()),
    ])
      .then(([muniTopo, provTopo]: [Topology, Topology]) => {
        const muniKey = Object.keys(muniTopo.objects)[0]
        const muniGeoms = (
          muniTopo.objects[muniKey] as {
            geometries: Array<{ properties: Record<string, unknown> }>
          }
        ).geometries

        // 구가 있는 일반시 → 시 이름으로 그룹핑 후 merge
        const cityGroups = new Map<string, typeof muniGeoms>()
        for (const geom of muniGeoms) {
          const name = geom.properties.name as string | undefined
          if (!name?.endsWith("구") || !name.includes("시")) continue
          const cityName = name.match(/^(.+시)/)?.[1]
          if (!cityName) continue
          if (!cityGroups.has(cityName)) cityGroups.set(cityName, [])
          cityGroups.get(cityName)!.push(geom)
        }

        const mergedCityFeatures: Array<GeoJSON.Feature> = []
        for (const [cityName, geoms] of cityGroups) {
          const merged = toMerge(
            muniTopo,
            geoms as Parameters<typeof toMerge>[1]
          )
          mergedCityFeatures.push({
            type: "Feature",
            geometry: merged,
            properties: { name: cityName },
          })
        }

        // 군 + 단일 시 (구 없는 시) — merge로 이미 만든 시는 원본에서 제외해 중복 방지
        const muniRaw = toFeature(
          muniTopo,
          muniTopo.objects[muniKey]
        ) as unknown as GeoJSON.FeatureCollection
        const gunFeatures = muniRaw.features.filter((f) => {
          const name = f.properties?.name as string | undefined
          if (!name || cityGroups.has(name)) return false
          return name.endsWith("군") || name.endsWith("시")
        })

        const provKey = Object.keys(provTopo.objects)[0]
        const provRaw = toFeature(
          provTopo,
          provTopo.objects[provKey]
        ) as unknown as GeoJSON.FeatureCollection
        const cityFeatures = provRaw.features.filter((f) =>
          METRO_CITIES.has(f.properties?.name as string)
        )

        const geojson: GeoJSON.FeatureCollection = {
          type: "FeatureCollection",
          features: [...cityFeatures, ...mergedCityFeatures, ...gunFeatures],
        }
        geojson.features.forEach((f, i) => {
          f.id = i
        })
        geojsonRef.current = geojson

        if (addLayers(map, MUNI_SRC, MUNI_FILL, MUNI_LINE, geojson)) {
          buildNameIndex(geojson.features)

          const computed: Array<Centroid> = []
          for (const f of geojson.features) {
            const name = f.properties?.name as string | undefined
            if (!name) continue
            const center = computeCentroid(f)
            if (center) computed.push({ name, lng: center[0], lat: center[1] })
          }
          setCentroids(computed)
          updateViewportCentroids(computed)

          // 빈 배경 클릭 시 선택 해제 (레이어 클릭과 충돌 없음)
          map.on("click", (e) => {
            if (decoratingRef.current) return
            const hits = map.queryRenderedFeatures(e.point, {
              layers: [MUNI_FILL],
            })
            if (!hits.length && map.getZoom() < PARTY_ENTER)
              setSelectedRegion(null)
          })

          setupClickHandler(map, MUNI_FILL, (name) => {
            if (decoratingRef.current) return
            // 초기 줌(경계선·지역명 미노출)에서는 지역 클릭으로 이동/등록하지 않음
            if (map.getZoom() < BOUNDARY_ZOOM) return
            // 안 가본 지역(색칠·사진 없음)은 줌인 대신 첫 여행 등록 플로우로 진입
            if (
              !Object.hasOwn(fillsRef.current, name) &&
              !photoRegionsRef.current.has(name)
            ) {
              startDecorate(name)
              return
            }
            setSelectedRegion(name)
            const c = computed.find((x) => x.name === name)
            if (c) flyToRegion(map, c)
          })

          const photoRegions = new Set(photos.map((p) => p.region))
          for (const f of geojson.features) {
            if (
              f.id !== undefined &&
              f.properties?.name &&
              photoRegions.has(f.properties.name as string)
            ) {
              map.setFeatureState(
                { source: MUNI_SRC, id: f.id },
                { hasPhoto: true }
              )
            }
          }
          photoRegionsRef.current = photoRegions
          setMapReady(true)
        }
      })
      .catch(console.error)
  }, [
    buildNameIndex,
    setupClickHandler,
    updateViewportCentroids,
    flyToRegion,
    startDecorate,
    photos,
  ])

  // onLoad 이벤트가 유실되는 경우(HMR 리마운트 등) 대비 — 로드 완료를 폴링해 초기화 보장
  React.useEffect(() => {
    if (initedRef.current) return
    const id = window.setInterval(() => {
      const map = mapRef.current?.getMap()
      if (!map?.loaded()) return
      window.clearInterval(id)
      handleMapLoad()
    }, 300)
    return () => window.clearInterval(id)
  }, [handleMapLoad])

  return (
    <div className="relative size-full">
      <MapGL
        ref={mapRef}
        initialViewState={KOREA_VIEW}
        mapStyle={MAP_STYLE}
        style={{ width: "100%", height: "100%" }}
        maxZoom={PARTY_ZOOM}
        onLoad={handleMapLoad}
        onMove={(e) => {
          const newZoom = e.viewState.zoom
          setZoomStage(getZoomStage(newZoom))
          drawImageFills()

          // RAF 스로틀 중 도착하는 이벤트도 버리지 않도록 최신 viewState를 ref에 보관,
          // RAF 콜백은 스케줄 시점 클로저가 아닌 ref의 최종 값으로 판정한다
          latestViewStateRef.current = {
            zoom: newZoom,
            longitude: e.viewState.longitude,
            latitude: e.viewState.latitude,
          }
          if (moveRafRef.current === null) {
            moveRafRef.current = requestAnimationFrame(() => {
              moveRafRef.current = null
              const vs = latestViewStateRef.current
              if (!vs) return
              updateViewportCentroids(centroids)
              if (decoratingRef.current) return

              if (
                vs.zoom >= PARTY_ENTER &&
                centroids.length > 0 &&
                !flyingRef.current
              ) {
                let nearest = centroids[0]
                let minDist = Infinity
                for (const c of centroids) {
                  const d =
                    (c.lng - vs.longitude) ** 2 + (c.lat - vs.latitude) ** 2
                  if (d < minDist) {
                    minDist = d
                    nearest = c
                  }
                }
                if (nearest.name !== selectedRegion) {
                  // 안 가본 지역(색칠·사진 없음)은 상세 진입 대신 "+" 버튼 노출 유지
                  const visited =
                    Object.hasOwn(fillsRef.current, nearest.name) ||
                    photoRegionsRef.current.has(nearest.name)
                  setSelectedRegion(visited ? nearest.name : null)
                }
              } else if (
                vs.zoom < PARTY_ENTER &&
                selectedRegion !== null &&
                !flyingRef.current
              ) {
                setSelectedRegion(null)
              }
            })
          }
        }}
      >
        {zoomStage >= 1 &&
          !selectedRegion &&
          !decorating &&
          viewportCentroids
            // 색칠은 첫 여행 등록 시에만 — 이미 색칠했거나 사진이 있는 지역은 "+" 미노출
            // 줌 2단계(zoomStage 1)는 관광지 상위 30%만, 줌 3단계(zoomStage 2+)는 전부 노출
            .filter(
              ({ name }) =>
                !Object.hasOwn(fills, name) &&
                !photoRegionSet.has(name) &&
                (zoomStage >= 2 || POPULAR_REGIONS.has(name))
            )
            .map(({ name, lng, lat }) => (
              <Marker
                key={`centroid-${name}`}
                longitude={lng}
                latitude={lat}
                anchor="center"
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
              </Marker>
            ))}

        {decorating && centroidMap.get(decorating) ? (
          <Marker
            longitude={centroidMap.get(decorating)!.lng}
            latitude={centroidMap.get(decorating)!.lat}
            anchor="center"
          >
            <span className="text-h2 text-fg-neutral-bold [text-shadow:0_0_32px_white]">
              {formatRegionName(decorating)}
            </span>
          </Marker>
        ) : null}

        {!selectedRegion &&
          !decorating &&
          visiblePins.map((p) => (
            <Marker
              key={`photo-${p.id}`}
              longitude={p.pinLng}
              latitude={p.pinLat}
              anchor="bottom"
            >
              <PhotoTile
                label={formatRegionName(p.region)}
                imageUrl={p.thumbnailUrl}
                size={PHOTO_PIN_SIZE}
                onClick={(e) => {
                  e.stopPropagation()
                  const map = mapInstanceRef.current
                  setSelectedRegion(p.region)
                  const c = centroidMap.get(p.region)
                  if (map && c) flyToRegion(map, c)
                }}
              />
            </Marker>
          ))}

        {!decorating &&
          partySlots.map((slot) => {
            const offset = partySlotOffset(slot.totalSlots, slot.slotIndex)
            const slotPhoto = slot.photo
            return (
              <Marker
                key={`slot-${slot.region}-${slot.memberId}`}
                longitude={slot.lng}
                latitude={slot.lat}
                anchor="center"
                offset={offset}
              >
                {slotPhoto ? (
                  <PhotoTile
                    label={slot.nickname}
                    imageUrl={slotPhoto.thumbnailUrl}
                    size={SLOT_SIZE_2X}
                    onClick={(e) => {
                      e.stopPropagation()
                      // 카드 클릭 → 사진 상세보기 (Figma 1319-14756 #3)
                      openPhotoViewer(slotPhoto.thumbnailUrl)
                    }}
                  />
                ) : slot.isMe ? (
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
              </Marker>
            )
          })}
      </MapGL>

      {/* image fill overlay — rendered above map, below UI */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 size-full"
      />

      {/* 지역 상세 — 뒤로가기 + 지역명 헤더 (Figma 1319-10362, 확장 시트가 덮을 땐 숨김) */}
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

      {/* 지역 상세 갤러리 패널 — dim 없이 지도 위 상시 노출, 핸들 드래그로 확장 */}
      {detailRegion ? (
        <GalleryPanel
          key={detailRegion}
          region={detailRegion}
          expanded={galleryExpanded}
          onExpandedChange={setGalleryExpanded}
        />
      ) : null}

      {/* 초기 줌에서만 노출되는 지역 사진 캐러셀 — 경계선 줌(1단계)부터 숨김 */}
      <RegionCardCarousel
        photos={photos}
        visible={zoomStage === 0 && !decorating}
        onSelectRegion={handleCarouselSelect}
      />

      {/* 첫 여행 등록 플로우 오버레이 (색상 → 날짜 → 사진) */}
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
