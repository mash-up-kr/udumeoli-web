import "maplibre-gl/dist/maplibre-gl.css"
import * as React from "react"
import { Map, Marker } from "react-map-gl/maplibre"
import Supercluster from "supercluster"
import type { MapRef } from "react-map-gl/maplibre"
import type { StyleSpecification } from "maplibre-gl"

import { usePhotos } from "@/entities/photo"

// 한국 중심 초기 뷰
const KOREA_VIEW = { longitude: 127.8, latitude: 36.2, zoom: 6 }

// keyless raster OSM (키 없는 시작점). 추후 MapTiler 벡터로 교체해 커스텀 스타일링.
const RASTER_OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
}

type PhotoPointProps = { photoId: string; thumbnailUrl: string }

export function TravelMapImpl() {
  const { data: photos = [] } = usePhotos()
  const mapRef = React.useRef<MapRef>(null)
  const [bounds, setBounds] = React.useState<[number, number, number, number] | null>(null)
  const [zoom, setZoom] = React.useState(KOREA_VIEW.zoom)

  // 줌 레벨별 클러스터링 인덱스
  const index = React.useMemo(() => {
    const sc = new Supercluster<PhotoPointProps>({ radius: 60, maxZoom: 16 })
    const points: Array<GeoJSON.Feature<GeoJSON.Point, PhotoPointProps>> = photos.map((p) => ({
      type: "Feature",
      properties: { photoId: p.id, thumbnailUrl: p.thumbnailUrl },
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
    }))
    sc.load(points)
    return sc
  }, [photos])

  const syncView = React.useCallback(() => {
    const map = mapRef.current?.getMap()
    if (!map) return
    const b = map.getBounds()
    setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()])
    setZoom(map.getZoom())
  }, [])

  const clusters = React.useMemo(
    () => (bounds ? index.getClusters(bounds, Math.round(zoom)) : []),
    [index, bounds, zoom]
  )

  return (
    <Map
      ref={mapRef}
      initialViewState={KOREA_VIEW}
      mapStyle={RASTER_OSM_STYLE}
      style={{ width: "100%", height: "100%" }}
      onLoad={syncView}
      onMoveEnd={syncView}
    >
      {clusters.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates as [number, number]
        const properties = feature.properties

        if ("cluster" in properties) {
          const clusterId = properties.cluster_id
          return (
            <Marker key={`cluster-${clusterId}`} longitude={lng} latitude={lat}>
              <button
                type="button"
                aria-label={`사진 ${properties.point_count}장`}
                onClick={() => {
                  const nextZoom = Math.min(index.getClusterExpansionZoom(clusterId), 16)
                  mapRef.current
                    ?.getMap()
                    .easeTo({ center: [lng, lat], zoom: nextZoom, duration: 400 })
                }}
                className="flex size-10 items-center justify-center rounded-full border-2 border-white bg-primary text-sm font-semibold text-primary-foreground shadow"
              >
                {properties.point_count}
              </button>
            </Marker>
          )
        }

        return (
          <Marker key={`photo-${properties.photoId}`} longitude={lng} latitude={lat}>
            <div className="size-12 overflow-hidden rounded-xl border-2 border-white shadow">
              <img src={properties.thumbnailUrl} alt="" className="size-full object-cover" />
            </div>
          </Marker>
        )
      })}
    </Map>
  )
}
