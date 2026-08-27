import * as React from "react"
import {
  APIProvider,
  AdvancedMarker,
  Map as GoogleMap,
  useMap,
} from "@vis.gl/react-google-maps"

import { getRecapMapView, getRecapScreenMapView } from "../lib/recap-map-config"
import type { RECAP_MAP_VIEW } from "../lib/recap-map-config"

import type { Photo } from "@/entities/photo"
import { findKeyword, groupTrips } from "@/entities/photo"
import { REGION_CODE_BY_NAME } from "@/shared/api/region-codes"
import { computeCentroid } from "@/shared/lib/geo"
import { loadKoreaGeoJson } from "@/shared/lib/loadKoreaGeoJson"

type Point = [number, number]
type Project = (point: Point) => Point

const MAP_OCEAN_COLOR = "#79d5e6"
const UNVISITED_REGION_COLOR = "#d8f3e3"
const REGION_BORDER_COLOR = "#f8fffb"
const MARKER_PIN = { x: 4.75, y: 0.6, width: 22, height: 25.5 }
const MARKER_ANCHOR = {
  x: MARKER_PIN.x + MARKER_PIN.width / 2,
  y: MARKER_PIN.y + MARKER_PIN.height,
}
const MARKER_STICKER = { x: 6.65, y: 2.75, width: 18.2, height: 18.2 }
const MARKER_BADGE = { x: 21.5, y: -4.5 }
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string
const GOOGLE_MAP_ID =
  (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined) ||
  "DEMO_MAP_ID"
const EMPTY_GEO: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [],
}

function makeProject(view: typeof RECAP_MAP_VIEW): Project {
  const mapSize = 256 * 2 ** view.zoom
  const centerX = ((view.center.lng + 180) / 360) * mapSize
  const centerSin = Math.sin((view.center.lat * Math.PI) / 180)
  const centerY =
    (0.5 - Math.log((1 + centerSin) / (1 - centerSin)) / (4 * Math.PI)) *
    mapSize

  return ([lng, lat]: Point): Point => {
    const sin = Math.sin((lat * Math.PI) / 180)
    const pixelX = ((lng + 180) / 360) * mapSize
    const pixelY =
      (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * mapSize
    let deltaX = pixelX - centerX
    if (deltaX > mapSize / 2) deltaX -= mapSize
    if (deltaX < -mapSize / 2) deltaX += mapSize
    return [
      ((deltaX + view.width / 2) / view.width) * 270,
      ((pixelY - centerY + view.height / 2) / view.height) * 480,
    ]
  }
}

function pathForFeature(feature: GeoJSON.Feature, project: Project): string {
  const geometry = feature.geometry
  const rings =
    geometry.type === "Polygon"
      ? geometry.coordinates
      : geometry.type === "MultiPolygon"
        ? geometry.coordinates.flat()
        : []

  return rings
    .map(
      (ring) =>
        ring
          .map((point, index) => {
            const [x, y] = project([point[0], point[1]])
            return `${index === 0 ? "M" : "L"}${x.toFixed(3)} ${y.toFixed(3)}`
          })
          .join(" ") + " Z"
    )
    .join(" ")
}

function regionCode(photo: Photo): string | undefined {
  return REGION_CODE_BY_NAME[photo.region]
}

function GoogleRecapLayer({
  geojson,
  photosByCode,
}: {
  geojson: GeoJSON.FeatureCollection
  photosByCode: Map<string, Array<Photo>>
}) {
  const map = useMap()

  React.useEffect(() => {
    if (!map || geojson.features.length === 0) return

    const data = new google.maps.Data()
    data.addGeoJson(geojson)
    data.setStyle((feature) => {
      const code = String(feature.getProperty("code") ?? "")
      const keyword = findKeyword(photosByCode.get(code)?.at(-1)?.keyword)
      return {
        fillColor: keyword?.mapColor ?? UNVISITED_REGION_COLOR,
        fillOpacity: keyword ? 0.68 : 0.08,
        strokeColor: REGION_BORDER_COLOR,
        strokeOpacity: keyword ? 0.32 : 0.08,
        strokeWeight: 1,
        clickable: false,
      }
    })
    data.setMap(map)

    return () => data.setMap(null)
  }, [geojson, map, photosByCode])

  return null
}

function GoogleRecapMap({
  geojson,
  photosByCode,
  markers,
  mapView,
}: {
  geojson: GeoJSON.FeatureCollection
  photosByCode: Map<string, Array<Photo>>
  markers: Array<{
    photo: Photo
    count: number
    geoPosition: Point
  }>
  mapView: typeof RECAP_MAP_VIEW
}) {
  return (
    <APIProvider apiKey={GOOGLE_MAPS_KEY} libraries={["marker"]}>
      <GoogleMap
        mapId={GOOGLE_MAP_ID}
        defaultCenter={mapView.center}
        defaultZoom={mapView.zoom}
        gestureHandling="none"
        disableDefaultUI
        clickableIcons={false}
        style={{ width: "100%", height: "100%" }}
      >
        <GoogleRecapLayer geojson={geojson} photosByCode={photosByCode} />
        {markers.map(({ photo, count, geoPosition }) => {
          const keyword = findKeyword(photo.keyword)
          if (!keyword) return null
          return (
            <AdvancedMarker
              key={`google-${photo.id}`}
              position={{ lat: geoPosition[1], lng: geoPosition[0] }}
            >
              <div className="relative size-10">
                <img
                  src={keyword.mapPinSrc}
                  alt=""
                  className="absolute inset-0 size-full"
                />
                <img
                  src={keyword.mapStickerSrc}
                  alt=""
                  className="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 object-contain"
                />
                {count > 1 ? (
                  <span
                    className="absolute -top-1 -right-2 min-w-4 rounded-full px-1 text-center text-[9px] leading-4 text-white"
                    style={{ backgroundColor: keyword.mapColor }}
                  >
                    {count}
                  </span>
                ) : null}
              </div>
            </AdvancedMarker>
          )
        })}
      </GoogleMap>
    </APIProvider>
  )
}

export const RecapMapPreview = React.memo(function RecapMapPreviewInner({
  photos,
  className,
  onReady,
  onError,
  onRetry,
  retryKey = 0,
}: {
  photos: Array<Photo>
  className?: string
  onReady?: () => void
  onError?: () => void
  onRetry?: () => void
  retryKey?: number
}) {
  const [geojson, setGeojson] = React.useState(EMPTY_GEO)
  const [nation, setNation] = React.useState<GeoJSON.Feature | null>(null)
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
    let active = true
    setHasError(false)
    void loadKoreaGeoJson()
      .then((geo) => {
        if (active) {
          setGeojson(geo.municipalities)
          setNation(geo.nation)
          onReady?.()
        }
      })
      .catch(() => {
        if (active) {
          setHasError(true)
          onError?.()
        }
      })
    return () => {
      active = false
    }
  }, [onError, onReady, retryKey])

  const includeIslands = React.useMemo(
    () =>
      photos.some(
        ({ lat, lng }) =>
          lng >= 130 || (lat <= 34.5 && lng >= 125 && lng <= 127.5)
      ),
    [photos]
  )
  const mapView = React.useMemo(
    () => getRecapMapView(includeIslands),
    [includeIslands]
  )
  const screenMapView = React.useMemo(
    () => getRecapScreenMapView(includeIslands),
    [includeIslands]
  )
  const project = React.useMemo(() => makeProject(mapView), [mapView])
  const projectedFeatures = React.useMemo(
    () =>
      geojson.features
        .map((feature) => ({
          feature,
          center: computeCentroid(feature),
        }))
        .map(({ feature, center }) => ({
          feature,
          path: pathForFeature(feature, project),
          center: center ? project(center) : null,
          geoCenter: center,
        })),
    [geojson, project]
  )
  const nationPath = React.useMemo(
    () => (nation ? pathForFeature(nation, project) : ""),
    [nation, project]
  )
  const photosByCode = React.useMemo(() => {
    const grouped = new Map<string, Array<Photo>>()
    for (const photo of photos) {
      const code = regionCode(photo)
      if (!code) continue
      const regionPhotos = grouped.get(code)
      if (regionPhotos) {
        regionPhotos.push(photo)
      } else {
        grouped.set(code, [photo])
      }
    }
    return grouped
  }, [photos])

  const markers = React.useMemo(() => {
    const byCode = new Map<string, { photo: Photo; count: number }>()
    for (const [code, regionPhotos] of photosByCode) {
      const trips = groupTrips(regionPhotos)
      const photo = trips[0]?.photos.at(-1)
      if (photo) byCode.set(code, { photo, count: trips.length })
    }
    return projectedFeatures.flatMap(({ feature, center, geoCenter }) => {
      const code = String(feature.properties?.code ?? "")
      const item = byCode.get(code)
      if (!item || !center || !geoCenter) return []
      return [{ ...item, position: center, geoPosition: geoCenter }]
    })
  }, [photosByCode, projectedFeatures])

  return (
    <div
      className={className}
      data-recap-map
      data-recap-map-view={includeIslands ? "full" : "mainland"}
    >
      {geojson.features.length > 0 && !hasError ? (
        <div className="absolute inset-0 z-0 overflow-hidden rounded-[30px]">
          <GoogleRecapMap
            geojson={geojson}
            photosByCode={photosByCode}
            markers={markers}
            mapView={screenMapView}
          />
        </div>
      ) : null}
      <svg
        viewBox="0 0 270 480"
        className="absolute inset-0 z-[-1] size-full opacity-0"
        role="img"
        aria-label="여행 기록 지도"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
      >
        <rect
          width="270"
          height="480"
          fill={MAP_OCEAN_COLOR}
          data-recap-ocean
        />
        {projectedFeatures.map(({ feature, path }, index) => {
          const code = String(feature.properties?.code ?? "")
          const photo = photosByCode.get(code)?.at(-1)
          const keyword = findKeyword(photo?.keyword)
          return (
            <path
              key={`${code}-${index}`}
              d={path}
              fill={keyword?.mapColor ?? UNVISITED_REGION_COLOR}
              fillOpacity={keyword ? "0.82" : "0.94"}
              data-recap-unvisited={keyword ? undefined : "true"}
              stroke={REGION_BORDER_COLOR}
              strokeOpacity="0.12"
              strokeWidth="0.35"
              strokeLinejoin="round"
            />
          )
        })}
        {nationPath ? (
          <path
            d={nationPath}
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.9"
            strokeWidth="1.1"
            strokeLinejoin="round"
            pointerEvents="none"
          />
        ) : null}
        {markers.map(({ photo, count, position }) => {
          const keyword = findKeyword(photo.keyword)
          if (!keyword) return null
          const markerX = position[0] - MARKER_ANCHOR.x
          const markerY = position[1] - MARKER_ANCHOR.y
          const badgeWidth = count > 9 ? 16 : 13.7
          return (
            <g key={photo.id} transform={`translate(${markerX} ${markerY})`}>
              <image
                href={keyword.mapPinSrc}
                x={MARKER_PIN.x}
                y={MARKER_PIN.y}
                width={MARKER_PIN.width}
                height={MARKER_PIN.height}
                preserveAspectRatio="xMidYMid meet"
              />
              <image
                href={keyword.mapStickerSrc}
                x={MARKER_STICKER.x}
                y={MARKER_STICKER.y}
                width={MARKER_STICKER.width}
                height={MARKER_STICKER.height}
                preserveAspectRatio={
                  keyword.mapStickerFit === "food"
                    ? "xMidYMid meet"
                    : "xMidYMid slice"
                }
              />
              {count > 1 ? (
                <g transform={`translate(${MARKER_BADGE.x} ${MARKER_BADGE.y})`}>
                  <rect
                    width={badgeWidth}
                    height="13.69"
                    rx="6.85"
                    fill={keyword.mapColor}
                  />
                  <text
                    x={badgeWidth / 2}
                    y="9.3"
                    textAnchor="middle"
                    fill="white"
                    fontSize="5.62"
                    fontWeight="500"
                  >
                    {count}
                  </text>
                </g>
              ) : null}
            </g>
          )
        })}
      </svg>
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#79d5e6]/90 px-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-[#232936]">
              지도를 불러오지 못했어요.
            </p>
            <button
              type="button"
              className="rounded-full bg-[#232936] px-3 py-1.5 text-xs font-medium text-white"
              onClick={onRetry}
            >
              다시 시도
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
})
