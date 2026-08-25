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
const MAP_PADDING = 4
const MAX_MAINLAND_SCALE = 1.42
const MAINLAND_OVERSCAN_X = 1.18
const MAINLAND_OVERSCAN_Y = 1.12

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

function isPreservedIslandPoint([lng, lat]: Point): boolean {
  const isJeju = lng > 125.5 && lng < 127.5 && lat > 32.8 && lat < 34.2
  const isDokdo = lng > 131 && lng < 132.5 && lat > 36 && lat < 38.5
  return isJeju || isDokdo
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
  const scaleX = (270 - MAP_PADDING * 2) / width
  const scaleY = Math.min(scaleX * 2, (480 - MAP_PADDING * 2) / height)
  const offsetX = (270 - width * scaleX) / 2
  const offsetY = (480 - height * scaleY) / 2

  const baseProject = ([lng, lat]: Point): Point => {
    const x = offsetX + (lng - minLng) * scaleX
    const y = offsetY + (maxLat - lat) * scaleY
    return [x, y]
  }

  const mainlandProjected = points
    .filter((point) => !isPreservedIslandPoint(point))
    .map(baseProject)
  if (mainlandProjected.length === 0) return baseProject

  const mainlandXs = mainlandProjected.map(([x]) => x)
  const mainlandYs = mainlandProjected.map(([, y]) => y)
  const mainlandWidth = Math.max(...mainlandXs) - Math.min(...mainlandXs)
  const mainlandHeight = Math.max(...mainlandYs) - Math.min(...mainlandYs)
  const mainlandScale = Math.min(
    MAX_MAINLAND_SCALE,
    (270 - MAP_PADDING * 2) / mainlandWidth,
    (480 - MAP_PADDING * 2) / mainlandHeight
  )
  const mainlandScaleX = mainlandScale * MAINLAND_OVERSCAN_X
  const mainlandScaleY = mainlandScale * MAINLAND_OVERSCAN_Y
  const mainlandCenter: Point = [
    (Math.min(...mainlandXs) + Math.max(...mainlandXs)) / 2,
    (Math.min(...mainlandYs) + Math.max(...mainlandYs)) / 2,
  ]

  return (point: Point) => {
    const projected = baseProject(point)
    if (isPreservedIslandPoint(point)) return projected
    return [
      mainlandCenter[0] + (projected[0] - mainlandCenter[0]) * mainlandScaleX,
      mainlandCenter[1] + (projected[1] - mainlandCenter[1]) * mainlandScaleY,
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

export const RecapMapPreview = React.memo(function RecapMapPreviewInner({
  photos,
  className,
  onReady,
}: {
  photos: Array<Photo>
  className?: string
  onReady?: () => void
}) {
  const [geojson, setGeojson] = React.useState(EMPTY_GEO)
  const [nation, setNation] = React.useState<GeoJSON.Feature | null>(null)

  React.useEffect(() => {
    let active = true
    void loadKoreaGeoJson().then((geo) => {
      if (active) {
        setGeojson(geo.municipalities)
        setNation(geo.nation)
        onReady?.()
      }
    })
    return () => {
      active = false
    }
  }, [onReady])

  const project = React.useMemo(() => makeProject(geojson.features), [geojson])
  const projectedFeatures = React.useMemo(
    () =>
      geojson.features.map((feature) => ({
        feature,
        path: pathForFeature(feature, project),
        center: computeCentroid(feature),
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
      return [{ ...item, position: project(center) }]
    })
  }, [photosByCode, project, projectedFeatures])

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
          const markerX = position[0] - 15.75
          const markerY = position[1] - 15.75
          const badgeWidth = count > 9 ? 16 : 13.7
          return (
            <g key={photo.id} transform={`translate(${markerX} ${markerY})`}>
              <image
                href={keyword.mapPinSrc}
                x="6.16"
                y="1.37"
                width="19.16"
                height="22.58"
                preserveAspectRatio="xMidYMid meet"
              />
              <image
                href={keyword.mapStickerSrc}
                x="7.53"
                y="2.74"
                width="16.42"
                height="16.42"
                preserveAspectRatio={
                  keyword.mapStickerFit === "food"
                    ? "xMidYMid meet"
                    : "xMidYMid slice"
                }
              />
              {count > 1 ? (
                <g transform="translate(20.53 -4.11)">
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
    </div>
  )
})
