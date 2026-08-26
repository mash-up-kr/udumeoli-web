import * as React from "react"

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
const MAP_FRAME = {
  left: 12,
  top: 100,
  width: 246,
  height: 364,
} as const
const MARKER_CENTER = 15.75
const MARKER_PIN = { x: 4.75, y: 0.6, width: 22, height: 25.5 }
const MARKER_STICKER = { x: 6.65, y: 2.75, width: 18.2, height: 18.2 }
const MARKER_BADGE = { x: 21.5, y: -4.5 }

const EMPTY_GEO: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [],
}

function coordinatesOf(feature: GeoJSON.Feature): Array<Point> {
  const geometry = feature.geometry
  if (geometry.type === "Polygon") {
    return geometry.coordinates.flat().map(([lng, lat]) => [lng, lat])
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.flat(2).map(([lng, lat]) => [lng, lat])
  }
  return []
}

function makeProject(features: Array<GeoJSON.Feature>): Project {
  const points = features.flatMap(coordinatesOf)
  const lngs = points.map(([lng]) => lng)
  const lats = points.map(([, lat]) => lat)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const width = Math.max(maxLng - minLng, 0.001)
  const height = Math.max(maxLat - minLat, 0.001)
  // The recap uses a tall art-directed map frame, but keeping the axes closer
  // to a real map prevents pins and region boundaries from drifting apart.
  const scaleX = MAP_FRAME.width / width
  const scaleY = Math.min(scaleX * 1.55, MAP_FRAME.height / height)
  const offsetX = MAP_FRAME.left + (MAP_FRAME.width - width * scaleX) / 2
  const offsetY = MAP_FRAME.top + (MAP_FRAME.height - height * scaleY) / 2

  return ([lng, lat]: Point): Point => {
    const x = offsetX + (lng - minLng) * scaleX
    const y = offsetY + (maxLat - lat) * scaleY
    return [x, y]
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

  const project = React.useMemo(() => makeProject(geojson.features), [geojson])
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
    return projectedFeatures.flatMap(({ feature, center }) => {
      const code = String(feature.properties?.code ?? "")
      const item = byCode.get(code)
      if (!item || !center) return []
      return [{ ...item, position: center }]
    })
  }, [photosByCode, projectedFeatures])

  return (
    <div className={className} data-recap-map>
      <svg
        viewBox="0 0 270 480"
        className="size-full"
        role="img"
        aria-label="여행 기록 지도"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
      >
        <rect width="270" height="480" fill={MAP_OCEAN_COLOR} />
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
          const markerX = position[0] - MARKER_CENTER
          const markerY = position[1] - MARKER_CENTER
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
