import "maplibre-gl/dist/maplibre-gl.css"
import * as React from "react"
import { Map as MapGL, Marker } from "react-map-gl/maplibre"
import { feature as toFeature } from "topojson-client"
import { Plus } from "lucide-react"
import { useRegionHighlight } from "./useRegionHighlight"
import type { MapRef } from "react-map-gl/maplibre"
import type { Map as MapLibreMap } from "maplibre-gl"
import type { Topology } from "topojson-specification"

import type { RegionFill } from "@/entities/region"
import { useAllPhotos } from "@/entities/photo"
import { useRegionColorStore } from "@/entities/region"
import { openGallerySheet } from "@/features/photo-gallery"
import { openColorPickerSheet } from "@/features/region-color"

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY as string
const MAP_STYLE = `https://api.maptiler.com/maps/019f1dec-144a-7e9c-9ab5-4398b89987f9/style.json?key=${MAPTILER_KEY}`
const KOREA_VIEW = { longitude: 127.8, latitude: 36.2, zoom: 6.5 }
const MUNICIPALITIES_URL =
  "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-municipalities-2018-topo-simple.json"

const ACCENT = "#F45B69"
const MUNI_SRC = "municipalities"
const MUNI_FILL = "municipality-fill"
const MUNI_LINE = "municipality-line"
const BOUNDARY_ZOOM = 7.5
const ZOOM_THRESHOLD = 9

type Centroid = { name: string; lng: number; lat: number }

function computeCentroid(feature: GeoJSON.Feature): [number, number] | null {
  const g = feature.geometry
  let coords: Array<Array<number>> = []
  if (g.type === "Polygon") coords = g.coordinates[0]
  else if (g.type === "MultiPolygon") coords = g.coordinates[0][0]
  else return null
  const lngs = coords.map((c) => c[0])
  const lats = coords.map((c) => c[1])
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
          0.35,
          hasColor,
          0.45,
          hasPhoto,
          0.06,
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
        "line-color": ["case", isActive, ACCENT, "#c8c8c8"],
        "line-width": ["case", isActive, 1.5, 0.5],
        "line-opacity": ["case", isActive, 0.9, 0.4],
      },
    },
    firstSymbolId
  )
  return true
}

export function TravelMapImpl() {
  const photos = useAllPhotos()
  const fills = useRegionColorStore((s) => s.fills)
  const mapRef = React.useRef<MapRef>(null)
  const mapInstanceRef = React.useRef<MapLibreMap | null>(null)
  const geojsonRef = React.useRef<GeoJSON.FeatureCollection | null>(null)
  const photoRegionsRef = React.useRef<Set<string>>(new Set())
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const imgCacheRef = React.useRef(new Map<string, HTMLImageElement>())
  const fillsRef = React.useRef(fills)
  const [zoom, setZoom] = React.useState(KOREA_VIEW.zoom)
  const [centroids, setCentroids] = React.useState<Array<Centroid>>([])
  const { setupClickHandler, activateByName, buildNameIndex, nameToIdRef } =
    useRegionHighlight()

  // keep fillsRef in sync so drawImageFills always sees latest fills
  React.useEffect(() => {
    fillsRef.current = fills
  }, [fills])

  const maxPerRegion = zoom >= ZOOM_THRESHOLD ? 2 : 1

  const visiblePhotos = React.useMemo(() => {
    const byRegion = new Map<string, typeof photos>()
    for (const p of photos) {
      byRegion.set(p.region, [...(byRegion.get(p.region) ?? []), p])
    }
    return [...byRegion.values()].flatMap((group) =>
      [...group]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, maxPerRegion)
    )
  }, [photos, maxPerRegion])

  // draw image fills onto canvas overlay
  const drawImageFills = React.useCallback(() => {
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

    fetch(MUNICIPALITIES_URL)
      .then((r) => r.json())
      .then((topo: Topology) => {
        const key = Object.keys(topo.objects)[0]
        const geojson = toFeature(
          topo,
          topo.objects[key]
        ) as unknown as GeoJSON.FeatureCollection
        geojson.features.forEach((f, i) => {
          f.id = i
        })
        geojsonRef.current = geojson

        if (addLayers(map, MUNI_SRC, MUNI_FILL, MUNI_LINE, geojson)) {
          buildNameIndex(geojson.features)
          setupClickHandler(map, MUNI_FILL, MUNI_SRC)

          const computed: Array<Centroid> = []
          for (const f of geojson.features) {
            const name = f.properties?.name as string | undefined
            if (!name) continue
            const center = computeCentroid(f)
            if (center) computed.push({ name, lng: center[0], lat: center[1] })
          }
          setCentroids(computed)

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
        onLoad={handleMapLoad}
        onMove={(e) => {
          setZoom(e.viewState.zoom)
          drawImageFills()
        }}
      >
        {zoom >= BOUNDARY_ZOOM &&
          centroids.map(({ name, lng, lat }) => (
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
                className="flex size-6 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
              >
                <Plus className="size-3.5 text-foreground/50" />
              </button>
            </Marker>
          ))}

        {visiblePhotos.map((p) => (
          <Marker
            key={`photo-${p.id}`}
            longitude={p.lng}
            latitude={p.lat}
            anchor="bottom"
          >
            <button
              type="button"
              aria-label={`${p.region} 사진`}
              onClick={(e) => {
                e.stopPropagation()
                const map = mapInstanceRef.current
                if (map) activateByName(map, MUNI_SRC, p.region)
                openGallerySheet(p.region)
              }}
              className="group relative block"
            >
              <span className="block size-12 overflow-hidden rounded-xl border-2 border-white shadow transition-transform group-hover:scale-105">
                <img
                  src={p.thumbnailUrl}
                  alt=""
                  className="size-full object-cover"
                />
              </span>
              <span className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 border-x-[6px] border-t-[8px] border-x-transparent border-t-white" />
            </button>
          </Marker>
        ))}
      </MapGL>

      {/* image fill overlay — rendered above map, below UI */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 size-full"
      />
    </div>
  )
}
