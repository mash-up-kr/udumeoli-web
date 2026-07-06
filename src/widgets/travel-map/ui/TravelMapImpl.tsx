import "maplibre-gl/dist/maplibre-gl.css"
import * as React from "react"
import { Map as MapGL, Marker } from "react-map-gl/maplibre"
import { feature as toFeature, merge as toMerge } from "topojson-client"
import { Plus } from "lucide-react"
import { useRegionHighlight } from "./useRegionHighlight"
import type { MapRef } from "react-map-gl/maplibre"
import type { Map as MapLibreMap } from "maplibre-gl"
import type { Topology } from "topojson-specification"

import type { RegionFill } from "@/entities/region"
import { useAllPhotos, usePhotoUploadStore } from "@/entities/photo"
import { useRegionColorStore } from "@/entities/region"
import { usePotStore } from "@/entities/travel-pot"
import { useSessionStore } from "@/entities/user"
import { openGallerySheet } from "@/features/photo-gallery"
import { openDatePickerSheet, pickImageFile } from "@/features/photo-upload"
import { openColorPickerSheet } from "@/features/region-color"

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
const BOUNDARY_ZOOM = 7.5 // 경계선 + "+" 버튼 등장
const ZOOM_COLOR = 8.5 // 2개 핀 + 72px 사이즈
const PARTY_ZOOM = 9.5 // 파티 슬롯 자동 노출 임계점 = 맵 최대 줌

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

function computeCentroid(feature: GeoJSON.Feature): [number, number] | null {
  const g = feature.geometry
  let rings: Array<Array<Array<number>>> = []
  if (g.type === "Polygon") rings = [g.coordinates[0]]
  else if (g.type === "MultiPolygon") rings = g.coordinates.map((p) => p[0])
  else return null

  if (rings.length === 0) return null

  // 가장 큰 폴리곤(본토) 기준
  const bbox = (ring: Array<Array<number>>) => {
    const lngs = ring.map((c) => c[0])
    const lats = ring.map((c) => c[1])
    return {
      lngs,
      lats,
      area:
        (Math.max(...lngs) - Math.min(...lngs)) *
        (Math.max(...lats) - Math.min(...lats)),
    }
  }
  const { lngs, lats } = rings
    .map(bbox)
    .reduce((a, b) => (a.area >= b.area ? a : b))
  return [
    (Math.min(...lngs) + Math.max(...lngs)) / 2,
    (Math.min(...lats) + Math.max(...lats)) / 2,
  ]
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
          hasColor,
          0.7,
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
  return true
}

const SLOT_SIZE_2X = 80

// 등간격 원형 분포 — N명을 원 위에 균등 배치, 겹치지 않음
function getSlotOffset(total: number, index: number): [number, number] {
  if (total === 1) return [0, 0]
  const radius = total <= 3 ? 64 : total <= 6 ? 80 : 96
  // 12시 방향 시작
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2
  return [Math.cos(angle) * radius, Math.sin(angle) * radius]
}

export function TravelMapImpl() {
  const photos = useAllPhotos()
  const fills = useRegionColorStore((s) => s.fills)
  const partyMembers = usePotStore(
    (s) => s.pots.find((p) => p.id === s.currentPotId)?.members ?? []
  )
  const currentUserId = useSessionStore((s) => s.currentUser?.id ?? null)
  const addPhoto = usePhotoUploadStore((s) => s.addPhoto)
  const mapRef = React.useRef<MapRef>(null)
  const mapInstanceRef = React.useRef<MapLibreMap | null>(null)
  const geojsonRef = React.useRef<GeoJSON.FeatureCollection | null>(null)
  const photoRegionsRef = React.useRef<Set<string>>(new Set())
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const imgCacheRef = React.useRef(new Map<string, HTMLImageElement>())
  const fillsRef = React.useRef(fills)
  const [zoom, setZoom] = React.useState(KOREA_VIEW.zoom)
  const [centroids, setCentroids] = React.useState<Array<Centroid>>([])
  const [viewportCentroids, setViewportCentroids] = React.useState<
    Array<Centroid>
  >([])
  const [selectedRegion, setSelectedRegion] = React.useState<string | null>(
    null
  )
  const flyingRef = React.useRef(false)
  const rafRef = React.useRef<number | null>(null)
  const { setupClickHandler, activateByName, buildNameIndex, nameToIdRef } =
    useRegionHighlight()

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

  React.useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // keep fillsRef in sync so drawImageFills always sees latest fills
  React.useEffect(() => {
    fillsRef.current = fills
  }, [fills])

  // 줌 단계별 핀 크기 (px) — 파티 슬롯은 SLOT_SIZE_2X 고정
  const pinSize = zoom >= ZOOM_COLOR ? 72 : 60

  // 단계별 지역당 최대 핀 수
  const maxPerRegion = zoom >= ZOOM_COLOR ? 2 : 1

  // 2단계: centroid 기준 좌우 배치, 1단계: 사진 실제 위치
  const visiblePins = React.useMemo(() => {
    const byRegion = new Map<string, typeof photos>()
    for (const p of photos) {
      byRegion.set(p.region, [...(byRegion.get(p.region) ?? []), p])
    }
    return [...byRegion.entries()].flatMap(([region, group]) => {
      const sorted = [...group]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, maxPerRegion)
      if (maxPerRegion === 1) {
        const c = centroids.find((x) => x.name === region)
        const lat = c?.lat ?? sorted[0].lat
        const lng = c?.lng ?? sorted[0].lng
        return sorted.map((p) => ({
          ...p,
          pinLat: lat,
          pinLng: lng,
          offset: [0, 0] as [number, number],
        }))
      }
      const c = centroids.find((x) => x.name === region)
      const lat = c?.lat ?? sorted[0].lat
      const lng = c?.lng ?? sorted[0].lng
      return sorted.map((p, i) => ({
        ...p,
        pinLat: lat,
        pinLng: lng,
        offset:
          sorted.length === 1
            ? ([0, 0] as [number, number])
            : i === 0
              ? ([-44, 0] as [number, number])
              : ([44, 0] as [number, number]),
      }))
    })
  }, [photos, maxPerRegion, centroids])

  const partySlots = React.useMemo<Array<PartySlot>>(() => {
    if (!selectedRegion || partyMembers.length === 0) return []
    const c = centroids.find((v) => v.name === selectedRegion)
    if (!c) return []
    const photoByUser = new Map<string, (typeof photos)[number]>()
    for (const p of photos) {
      if (p.region === selectedRegion) photoByUser.set(p.uploaderId, p)
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
  }, [selectedRegion, partyMembers, photos, centroids, currentUserId])

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
      canvas.width = container.offsetWidth
      canvas.height = container.offsetHeight

      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

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
  }, [fills, nameToIdRef, drawImageFills])

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
    if (!map) return
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

        // 군 + 단일 시 (구 없는 시)
        const muniRaw = toFeature(
          muniTopo,
          muniTopo.objects[muniKey]
        ) as unknown as GeoJSON.FeatureCollection
        const gunFeatures = muniRaw.features.filter((f) => {
          const name = f.properties?.name as string | undefined
          return name?.endsWith("군") || name?.endsWith("시")
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
            const hits = map.queryRenderedFeatures(e.point, {
              layers: [MUNI_FILL],
            })
            if (!hits.length && map.getZoom() < PARTY_ZOOM)
              setSelectedRegion(null)
          })

          setupClickHandler(map, MUNI_FILL, MUNI_SRC, (name) => {
            setSelectedRegion(name)
            flyingRef.current = true
            map.once("moveend", () => {
              flyingRef.current = false
            })
            const c = computed.find((x) => x.name === name)
            if (c)
              map.flyTo({
                center: [c.lng, c.lat],
                zoom: PARTY_ZOOM,
                duration: 350,
              })
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
        }
      })
      .catch(console.error)
  }, [buildNameIndex, setupClickHandler])

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
          setZoom(newZoom)
          drawImageFills()
          updateViewportCentroids(centroids)

          if (
            newZoom >= PARTY_ZOOM &&
            centroids.length > 0 &&
            !flyingRef.current
          ) {
            const { longitude, latitude } = e.viewState
            let nearest = centroids[0]
            let minDist = Infinity
            for (const c of centroids) {
              const d = (c.lng - longitude) ** 2 + (c.lat - latitude) ** 2
              if (d < minDist) {
                minDist = d
                nearest = c
              }
            }
            if (nearest.name !== selectedRegion) setSelectedRegion(nearest.name)
          } else if (
            newZoom < PARTY_ZOOM &&
            selectedRegion !== null &&
            !flyingRef.current
          ) {
            setSelectedRegion(null)
          }
        }}
      >
        {zoom >= BOUNDARY_ZOOM &&
          !selectedRegion &&
          viewportCentroids.map(({ name, lng, lat }) => (
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
                  const map = mapInstanceRef.current
                  if (map) activateByName(map, MUNI_SRC, name)
                  openColorPickerSheet(name)
                }}
                className="flex flex-col items-center gap-0.5 transition-transform hover:scale-110 active:scale-95"
              >
                <Plus className="size-3.5 text-foreground/40 drop-shadow-sm" />
                <span className="text-[9px] leading-none font-medium text-foreground/60 drop-shadow-sm">
                  {name}
                </span>
              </button>
            </Marker>
          ))}

        {!selectedRegion &&
          visiblePins.map((p) => (
            <Marker
              key={`photo-${p.id}`}
              longitude={p.pinLng}
              latitude={p.pinLat}
              anchor="bottom"
              offset={p.offset}
            >
              <button
                type="button"
                aria-label={`${p.region} 사진`}
                onClick={(e) => {
                  e.stopPropagation()
                  const map = mapInstanceRef.current
                  if (map) activateByName(map, MUNI_SRC, p.region)
                  setSelectedRegion(p.region)
                  flyingRef.current = true
                  const c = centroids.find((x) => x.name === p.region)
                  if (map && c) {
                    map.flyTo({
                      center: [c.lng, c.lat],
                      zoom: PARTY_ZOOM,
                      duration: 350,
                    })
                    map.once("moveend", () => {
                      flyingRef.current = false
                    })
                  } else {
                    flyingRef.current = false
                  }
                  openGallerySheet(p.region)
                }}
                className="group flex flex-col items-center gap-1"
              >
                <span className="rounded-full bg-bg-neutral-weak px-3 py-1 text-h9 text-fg-neutral-bold shadow-[0px_0px_10px_rgba(142,150,169,0.12)]">
                  {p.region}
                </span>
                <span
                  className="block overflow-hidden rounded-2xl border-2 border-stroke-neutral-inverse shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)] transition-all group-hover:scale-105"
                  style={{ width: pinSize, height: pinSize }}
                >
                  <img
                    src={p.thumbnailUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                </span>
              </button>
            </Marker>
          ))}

        {partySlots.map((slot) => {
          const offset = getSlotOffset(slot.totalSlots, slot.slotIndex)
          return (
            <Marker
              key={`slot-${slot.region}-${slot.memberId}`}
              longitude={slot.lng}
              latitude={slot.lat}
              anchor="center"
              offset={offset}
            >
              {slot.photo ? (
                <button
                  type="button"
                  aria-label={`${slot.region} 사진`}
                  onClick={(e) => {
                    e.stopPropagation()
                    const map = mapInstanceRef.current
                    if (map) activateByName(map, MUNI_SRC, slot.region)
                    openGallerySheet(slot.region)
                  }}
                  className="group flex flex-col items-center gap-1"
                >
                  <span className="rounded-full bg-bg-neutral-weak px-3 py-1 text-h9 text-fg-neutral-bold shadow-[0px_0px_10px_rgba(142,150,169,0.12)]">
                    {slot.nickname}
                  </span>
                  <span
                    className="block overflow-hidden rounded-2xl border-2 border-stroke-neutral-inverse shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)] transition-all group-hover:scale-105"
                    style={{ width: SLOT_SIZE_2X, height: SLOT_SIZE_2X }}
                  >
                    <img
                      src={slot.photo.thumbnailUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  </span>
                </button>
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
            </Marker>
          )
        })}
      </MapGL>

      {/* image fill overlay — rendered above map, below UI */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 size-full"
      />
    </div>
  )
}
