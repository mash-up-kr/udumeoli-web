import * as React from "react"

import type { Photo } from "@/entities/photo"
import { findKeyword, groupTrips } from "@/entities/photo"
import { REGION_CODE_BY_NAME } from "@/shared/api/region-codes"
import { computeCentroid } from "@/shared/lib/geo"
import { loadKoreaGeoJson } from "@/shared/lib/loadKoreaGeoJson"

type Point = [number, number]
type Project = (point: Point) => Point

const MAP_SCALE = 1.06

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
  const scaleX = 270 / width
  const scaleY = Math.min(scaleX * 1.7, 480 / height)
  const offsetX = (270 - width * scaleX) / 2
  const offsetY = (480 - height * scaleY) / 2

  return ([lng, lat]) => {
    const x = offsetX + (lng - minLng) * scaleX
    const y = offsetY + (maxLat - lat) * scaleY
    return [135 + (x - 135) * MAP_SCALE, 240 + (y - 240) * MAP_SCALE]
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
            return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`
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

  React.useEffect(() => {
    let active = true
    void loadKoreaGeoJson().then((geo) => {
      if (active) {
        setGeojson(geo.municipalities)
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
      >
        <rect width="270" height="480" fill="#79d5e6" />
        {projectedFeatures.map(({ feature, path }, index) => {
          const code = String(feature.properties?.code ?? "")
          const photo = photosByCode.get(code)?.at(-1)
          const keyword = findKeyword(photo?.keyword)
          return (
            <path
              key={`${code}-${index}`}
              d={path}
              fill={keyword?.mapColor ?? "#b9efd8"}
              fillOpacity={keyword ? "0.62" : "0.86"}
              stroke={keyword?.mapColor ?? "#e8fff3"}
              strokeOpacity={keyword ? "0.62" : "0.75"}
              strokeWidth="0.5"
            />
          )
        })}
        {projectedFeatures.map(({ feature, center }) => {
          const code = String(feature.properties?.code ?? "")
          const name = String(feature.properties?.name ?? "")
          if (!name || !center || !photosByCode.has(code)) return null
          const [x, y] = project(center)
          return (
            <text
              key={`label-${code}`}
              x={x}
              y={y + 10}
              textAnchor="middle"
              fill="#232936"
              fillOpacity="0.82"
              fontSize="4.5"
              fontWeight="600"
              paintOrder="stroke"
              stroke="#ffffff"
              strokeOpacity="0.72"
              strokeWidth="1.2"
              pointerEvents="none"
            >
              {name}
            </text>
          )
        })}
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
                preserveAspectRatio="none"
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
