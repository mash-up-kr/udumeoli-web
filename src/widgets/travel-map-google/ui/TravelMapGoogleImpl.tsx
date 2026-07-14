/**
 * Google Maps 이식 스파이크 (#76) — MapLibre 구현(widgets/travel-map)의 전체 기능 포팅.
 *
 * 확정 아님, PoC 검증용. 알려진 gap:
 * - 점선 강조(dashed border): Data API가 폴리곤 stroke dash를 지원 안 해 굵은 실선으로 근사
 * - flyTo/fitBounds 애니메이션: Google panTo/fitBounds는 duration 옵션이 없어 즉시 이동(gap)
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
import {
  REGION_CENTERS,
  useAllPhotos,
  usePhotoUploadStore,
} from "@/entities/photo"
import { useRegionColorStore } from "@/entities/region"
import { usePotStore } from "@/entities/travel-pot"
import { useSessionStore } from "@/entities/user"
import { ButtonIcon } from "@/shared/ui/button-icon"
import { GalleryPanel, openPhotoViewer } from "@/features/photo-gallery"
import { openDatePickerSheet, pickImageFile } from "@/features/photo-upload"
import {
  RegionDecorateFlow,
  useDecorateStore,
} from "@/features/region-decorate"
import iconArrowLeftSrc from "@/shared/assets/icon-arrow-left.svg"
import {
  computeCentroid,
  computeFeatureBBox,
  getSlotOffset,
} from "@/shared/lib/geo"
import { loadKoreaGeoJson } from "@/shared/lib/loadKoreaGeoJson"
import { PhotoTile } from "@/shared/ui/photo-tile"
import { RegionCardCarousel } from "@/shared/ui/region-card-carousel"

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string
// mapId 미발급 시 Google이 제공하는 프로토타이핑용 데모 ID로 대체 (AdvancedMarker는 mapId 필수)
const GOOGLE_MAP_ID =
  (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined) ||
  "DEMO_MAP_ID"

const KOREA_VIEW = { lat: 36.2, lng: 127.8, zoom: 6.5 }
const ACCENT = "#6cbcf9" // brand blue (--color-blue-500)
const DASH_DARK = "#232936"
const DASH_ORANGE = "#ff9331"
const BOUNDARY_ZOOM = 7.5
const ZOOM_COLOR = 8.5
const PARTY_ZOOM = 9.5
// 관성 줌이 maxZoom 직전(9.4999…)에서 멈춰도 3단계로 인정하는 여유치 (MapLibre 구현과 동일)
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

function getZoomStage(zoom: number): 0 | 1 | 2 | 3 {
  if (zoom >= PARTY_ENTER) return 3
  if (zoom >= ZOOM_COLOR) return 2
  if (zoom >= BOUNDARY_ZOOM) return 1
  return 0
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
  decorateStep,
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
  decorateStep: "color" | "date" | "photo"
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
            if ((map.getZoom() ?? 0) < PARTY_ENTER) setSelectedRegion(null)
          })
        )

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
            // Google은 move 이벤트가 idle에서만 안정되므로 제스처 종료 시점에 판정한다
            if (decoratingRef.current) return
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
              if (nearest.name !== selectedRegionRef.current)
                setSelectedRegion(nearest.name)
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

  // 등록 플로우 진입/이탈 — 제스처 잠금 + 강조 테두리 + fitBounds
  React.useEffect(() => {
    if (!map) return
    if (decorating) {
      map.setOptions({ gestureHandling: "none" })
      dataLayerRef.current?.sync({
        decorateRegion: decorating,
        decorateColor: decorateStep === "color" ? DASH_DARK : DASH_ORANGE,
      })
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
  }, [decorating, decorateStep, map, dataLayerRef, geojsonRef])

  return null
}

function TravelMapGoogleInner({ onRegionDetailChange }: TravelMapImplProps) {
  const photos = useAllPhotos()
  const fills = useRegionColorStore((s) => s.fills)
  const partyMembers = usePotStore(
    (s) => s.pots.find((p) => p.id === s.currentPotId)?.members ?? []
  )
  const currentUserId = useSessionStore((s) => s.currentUser?.id ?? null)
  const addPhoto = usePhotoUploadStore((s) => s.addPhoto)

  const mapRef = React.useRef<google.maps.Map | null>(null)
  const geojsonRef = React.useRef<GeoJSON.FeatureCollection | null>(null)
  const dataLayerRef = React.useRef<RegionDataLayer | null>(null)
  const overlayRef = React.useRef<ImageFillOverlay | null>(null)
  const centroidsRef = React.useRef<Array<Centroid>>([])
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
  const decorateStep = useDecorateStore((s) => s.step)
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

  const flyToRegion = React.useCallback((c: Centroid) => {
    // Google panTo/setZoom엔 duration 옵션이 없어 즉시 이동 (MapLibre flyTo 대비 gap)
    mapRef.current?.panTo({ lat: c.lat, lng: c.lng })
    mapRef.current?.setZoom(PARTY_ZOOM)
  }, [])

  const handleBackToHome = React.useCallback(() => {
    setSelectedRegion(null)
    mapRef.current?.panTo({ lat: KOREA_VIEW.lat, lng: KOREA_VIEW.lng })
    mapRef.current?.setZoom(KOREA_VIEW.zoom)
  }, [])

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

  const pinSize = zoomStage >= 2 ? 72 : 60
  const maxPerRegion = zoomStage >= 2 ? 2 : 1

  const visiblePins = React.useMemo(() => {
    const byRegion = new Map<string, typeof photos>()
    for (const p of photos) {
      byRegion.set(p.region, [...(byRegion.get(p.region) ?? []), p])
    }
    return [...byRegion.entries()].flatMap(([region, group]) => {
      const sorted = [...group]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, maxPerRegion)
      const c = centroidMap.get(region)
      const lat = c?.lat ?? sorted[0].lat
      const lng = c?.lng ?? sorted[0].lng
      return sorted.map((p, i) => ({
        ...p,
        pinLat: lat,
        pinLng: lng,
        offset:
          sorted.length < 2
            ? ([0, 0] as [number, number])
            : i === 0
              ? ([-44, 0] as [number, number])
              : ([44, 0] as [number, number]),
      }))
    })
  }, [photos, maxPerRegion, centroidMap])

  const partySlots = React.useMemo<Array<PartySlot>>(() => {
    if (!selectedRegion || partyMembers.length === 0) return []
    const c = centroidMap.get(selectedRegion)
    if (!c) return []
    const photoByUser = new Map<string, (typeof photos)[number]>()
    for (const p of photos) {
      if (p.region !== selectedRegion) continue
      const existing = photoByUser.get(p.uploaderId)
      if (!existing || p.date > existing.date) photoByUser.set(p.uploaderId, p)
    }
    const total = partyMembers.length
    return partyMembers.map((member, i) => {
      const photo = photoByUser.get(member.id) ?? null
      return {
        region: selectedRegion,
        lat: c.lat,
        lng: c.lng,
        memberId: member.id,
        nickname: member.nickname,
        photo: photo ? { thumbnailUrl: photo.thumbnailUrl } : null,
        isMe: member.id === currentUserId,
        slotIndex: i,
        totalSlots: total,
      }
    })
  }, [selectedRegion, partyMembers, photos, centroidMap, currentUserId])

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
          decorateStep={decorateStep}
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
            .filter(
              ({ name }) =>
                !Object.hasOwn(fills, name) && !photoRegionSet.has(name)
            )
            .map(({ name, lng, lat }) => (
              <AdvancedMarker
                key={`centroid-${name}`}
                position={{ lat, lng }}
                anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
              >
                <button
                  type="button"
                  aria-label={`${name} 꾸미기`}
                  onClick={(e) => {
                    e.stopPropagation()
                    startDecorate(name)
                  }}
                  className="flex flex-col items-center gap-0.5 transition-transform hover:scale-110 active:scale-95"
                >
                  <Plus className="size-3.5 text-foreground/40 drop-shadow-sm" />
                  <span className="text-[9px] leading-none font-medium text-foreground/60 drop-shadow-sm">
                    {name}
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
            <span className="text-h1 text-fg-neutral-bold [text-shadow:0_0_32px_white]">
              {decorating}
            </span>
          </AdvancedMarker>
        ) : null}

        {!selectedRegion &&
          !decorating &&
          visiblePins.map((p) => (
            <AdvancedMarker
              key={`photo-${p.id}`}
              position={{ lat: p.pinLat, lng: p.pinLng }}
            >
              <div
                style={{
                  transform: `translate(${p.offset[0]}px, ${p.offset[1]}px)`,
                }}
              >
                <PhotoTile
                  label={p.region}
                  imageUrl={p.thumbnailUrl}
                  size={pinSize}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedRegion(p.region)
                    const c = centroidMap.get(p.region)
                    if (c) flyToRegion(c)
                  }}
                />
              </div>
            </AdvancedMarker>
          ))}

        {!decorating &&
          partySlots.map((slot) => {
            const offset = getSlotOffset(slot.totalSlots, slot.slotIndex)
            const slotPhoto = slot.photo
            return (
              <AdvancedMarker
                key={`slot-${slot.region}-${slot.memberId}`}
                position={{ lat: slot.lat, lng: slot.lng }}
                anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
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
                  ) : slot.isMe ? (
                    <button
                      type="button"
                      aria-label="내 사진 등록"
                      onClick={(e) => {
                        e.stopPropagation()
                        pickImageFile((url) => {
                          openDatePickerSheet((date) => {
                            if (!currentUserId) return
                            addPhoto({
                              id: `uploaded-${Date.now()}`,
                              lat: slot.lat,
                              lng: slot.lng,
                              thumbnailUrl: url,
                              date,
                              uploaderId: currentUserId,
                              region: slot.region,
                            })
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
            <span className="text-h3 text-fg-neutral-bold">{detailRegion}</span>
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
