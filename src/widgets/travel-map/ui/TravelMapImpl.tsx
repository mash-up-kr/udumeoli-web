import "maplibre-gl/dist/maplibre-gl.css"
import * as React from "react"
import { Map as MapGL, Marker } from "react-map-gl/maplibre"
import { feature as toFeature } from "topojson-client"
import type { MapRef } from "react-map-gl/maplibre"
import type { Map as MapLibreMap } from "maplibre-gl"
import type { Topology } from "topojson-specification"

import { useAllPhotos } from "@/entities/photo"
import { openGallerySheet } from "@/features/photo-gallery"

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY as string
const MAP_STYLE = `https://api.maptiler.com/maps/019f1dec-144a-7e9c-9ab5-4398b89987f9/style.json?key=${MAPTILER_KEY}`
const KOREA_VIEW = { longitude: 127.8, latitude: 36.2, zoom: 6.5 }

const PROVINCES_URL =
  "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-provinces-2018-geo.json"
const MUNICIPALITIES_URL =
  "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-municipalities-2018-topo-simple.json"

// = --color-highlight. maplibre paint(WebGL)은 CSS 토큰을 못 읽어 리터럴 유지
const HIGHLIGHT_COLOR = "#F45B69"

const PROV_SRC = "provinces"
const PROV_FILL = "province-fill"
const PROV_LINE = "province-line"
const PROV_MAX_ZOOM = 8

const MUNI_SRC = "municipalities"
const MUNI_FILL = "municipality-fill"
const MUNI_LINE = "municipality-line"
const MUNI_MIN_ZOOM = 8

function addLayers(
  map: MapLibreMap,
  srcId: string,
  fillId: string,
  lineId: string,
  data: GeoJSON.FeatureCollection,
  minzoom?: number,
  maxzoom?: number
): boolean {
  if (map.getSource(srcId)) return false
  map.addSource(srcId, { type: "geojson", data, generateId: true })
  const firstSymbolId = map
    .getStyle()
    .layers.find((l) => l.type === "symbol")?.id
  map.addLayer(
    {
      id: fillId,
      type: "fill",
      source: srcId,
      ...(minzoom !== undefined ? { minzoom } : {}),
      ...(maxzoom !== undefined ? { maxzoom } : {}),
      paint: {
        "fill-color": HIGHLIGHT_COLOR,
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "active"], false],
          0.8,
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
      ...(minzoom !== undefined ? { minzoom } : {}),
      ...(maxzoom !== undefined ? { maxzoom } : {}),
      paint: {
        "line-color": HIGHLIGHT_COLOR,
        "line-width": 0.8,
        "line-opacity": 0.35,
      },
    },
    firstSymbolId
  )
  return true
}

function setupClickHandler(
  map: MapLibreMap,
  fillId: string,
  srcId: string,
  activeRef: React.MutableRefObject<{ src: string; id: string | number } | null>
) {
  map.on("click", fillId, (e) => {
    const feature = e.features?.[0]
    if (!feature) return
    const id = feature.id
    if (activeRef.current !== null) {
      map.setFeatureState(
        { source: activeRef.current.src, id: activeRef.current.id },
        { active: false }
      )
    }
    if (
      activeRef.current !== null &&
      activeRef.current.src === srcId &&
      activeRef.current.id === id
    ) {
      activeRef.current = null
    } else if (id !== undefined) {
      activeRef.current = { src: srcId, id }
      map.setFeatureState({ source: srcId, id }, { active: true })
    }
  })
  map.on("mouseenter", fillId, () => {
    map.getCanvas().style.cursor = "pointer"
  })
  map.on("mouseleave", fillId, () => {
    map.getCanvas().style.cursor = ""
  })
}

export function TravelMapImpl() {
  const photos = useAllPhotos()
  const mapRef = React.useRef<MapRef>(null)
  const [zoom, setZoom] = React.useState(KOREA_VIEW.zoom)
  const activeRef = React.useRef<{ src: string; id: string | number } | null>(
    null
  )

  const visiblePhotos = React.useMemo(() => {
    const byRegion = new Map<string, typeof photos>()
    for (const p of photos) {
      const group = byRegion.get(p.region) ?? []
      group.push(p)
      byRegion.set(p.region, group)
    }
    for (const [region, group] of byRegion) {
      byRegion.set(
        region,
        [...group].sort((a, b) => b.date.localeCompare(a.date))
      )
    }
    const limit = zoom < PROV_MAX_ZOOM ? 1 : 2
    const result: typeof photos = []
    for (const group of byRegion.values()) {
      result.push(...group.slice(0, limit))
    }
    return result
  }, [photos, zoom])

  const syncView = React.useCallback(() => {
    const map = mapRef.current?.getMap()
    if (!map) return
    setZoom(map.getZoom())
  }, [])

  const handleMapLoad = React.useCallback(() => {
    syncView()
    const map = mapRef.current?.getMap()
    if (!map) return

    fetch(PROVINCES_URL)
      .then((r) => r.json())
      .then((data: GeoJSON.FeatureCollection) => {
        if (
          addLayers(
            map,
            PROV_SRC,
            PROV_FILL,
            PROV_LINE,
            data,
            undefined,
            PROV_MAX_ZOOM
          )
        ) {
          setupClickHandler(map, PROV_FILL, PROV_SRC, activeRef)
        }
      })
      .catch(console.error)

    fetch(MUNICIPALITIES_URL)
      .then((r) => r.json())
      .then((topo: Topology) => {
        const key = Object.keys(topo.objects)[0]
        const geojson = toFeature(
          topo,
          topo.objects[key]
        ) as unknown as GeoJSON.FeatureCollection
        if (
          addLayers(map, MUNI_SRC, MUNI_FILL, MUNI_LINE, geojson, MUNI_MIN_ZOOM)
        ) {
          setupClickHandler(map, MUNI_FILL, MUNI_SRC, activeRef)
        }
      })
      .catch(console.error)
  }, [syncView])

  return (
    <MapGL
      ref={mapRef}
      initialViewState={KOREA_VIEW}
      mapStyle={MAP_STYLE}
      style={{ width: "100%", height: "100%" }}
      onLoad={handleMapLoad}
      onMoveEnd={syncView}
    >
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
              openGallerySheet(p.region)
            }}
            className="relative block"
          >
            <span className="block size-12 overflow-hidden rounded-xl border-2 border-white shadow">
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
  )
}
