import * as React from "react"
import {
  APIProvider,
  AdvancedMarker,
  Map as GoogleMap,
  useMap,
} from "@vis.gl/react-google-maps"

import {
  PROVINCE_AGGREGATE_MAX_REGIONS,
  buildProvinceAggregates,
} from "../lib/province-markers"
import { estimateTextWidth } from "../lib/recap-layout"
import { getRecapMapView, getRecapScreenMapView } from "../lib/recap-map-config"
import type { Point, RegionShape } from "../lib/province-markers"
import type { RECAP_MAP_VIEW } from "../lib/recap-map-config"

import type { Photo, TravelKeyword } from "@/entities/photo"
import { findKeyword, groupTrips } from "@/entities/photo"
import { formatProvinceBadgeName } from "@/entities/region"
import { computeCentroid } from "@/shared/lib/geo"
import { loadKoreaGeoJson } from "@/shared/lib/loadKoreaGeoJson"

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
/** 도 라벨 (시안 3229-11008) — 핀 아래 중앙 알약 */
const PROVINCE_LABEL = { gap: 3, height: 12.5, fontSize: 7.5, paddingX: 4 }

type RecapMarker = {
  key: string
  keyword: TravelKeyword
  /** 시 단위 마커의 우상단 방문 횟수 뱃지 (1이면 감춤) */
  count: number
  /** 도 단위 마커의 하단 라벨 — "강원+2" */
  label?: string
  position: Point
  geoPosition: Point
}

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

function featureRegion(feature: GeoJSON.Feature): string {
  return String(feature.properties?.name ?? "")
}

function GoogleRecapLayer({
  geojson,
  fillKeywords,
}: {
  geojson: GeoJSON.FeatureCollection
  fillKeywords: Map<string, TravelKeyword>
}) {
  const map = useMap()

  React.useEffect(() => {
    if (!map || geojson.features.length === 0) return

    const data = new google.maps.Data()
    data.addGeoJson(geojson)
    data.setStyle((feature) => {
      const keyword = fillKeywords.get(String(feature.getId() ?? ""))
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
  }, [fillKeywords, geojson, map])

  return null
}

function GoogleRecapMap({
  geojson,
  fillKeywords,
  markers,
  mapView,
}: {
  geojson: GeoJSON.FeatureCollection
  fillKeywords: Map<string, TravelKeyword>
  markers: Array<RecapMarker>
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
        <GoogleRecapLayer geojson={geojson} fillKeywords={fillKeywords} />
        {markers.map(({ key, keyword, count, label, geoPosition }) => (
          <AdvancedMarker
            key={`google-${key}`}
            position={{ lat: geoPosition[1], lng: geoPosition[0] }}
          >
            {/* AdvancedMarker 기본 앵커는 컨텐츠 박스의 bottom-center다 — 라벨을
                흐름에 두면 박스가 커져 핀이 지역 중심 위로 떠버린다. 저장 SVG처럼
                핀 끝이 중심에 오도록 라벨은 absolute로 박스 밖에 건다. */}
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
              {label ? (
                <span
                  className="absolute top-full left-1/2 mt-[3px] -translate-x-1/2 rounded-full px-1.5 text-[10px] leading-4 whitespace-nowrap text-white"
                  style={{ backgroundColor: keyword.mapColor }}
                >
                  {label}
                </span>
              ) : count > 1 ? (
                <span
                  className="absolute -top-1 -right-2 min-w-4 rounded-full px-1 text-center text-[9px] leading-4 text-white"
                  style={{ backgroundColor: keyword.mapColor }}
                >
                  {count}
                </span>
              ) : null}
            </div>
          </AdvancedMarker>
        ))}
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
  const photosByRegion = React.useMemo(() => {
    const grouped = new Map<string, Array<Photo>>()
    for (const photo of photos) {
      const regionPhotos = grouped.get(photo.region)
      if (regionPhotos) {
        regionPhotos.push(photo)
      } else {
        grouped.set(photo.region, [photo])
      }
    }
    return grouped
  }, [photos])

  /**
   * feature id → 그 지역의 사진. 이름이 같은 지역이 둘 있어서(강원·경남 고성군)
   * 이름으로 칠하면 엉뚱한 곳까지 물든다 — 먼저 나오는 feature 하나만 잡는다.
   * ponytail: photo.region이 코드로 바뀌면 이 dedupe는 지운다.
   */
  const photosByFeature = React.useMemo(() => {
    const matched = new Map<string, Array<Photo>>()
    const usedRegions = new Set<string>()
    for (const { feature } of projectedFeatures) {
      const region = featureRegion(feature)
      const regionPhotos = photosByRegion.get(region)
      if (!regionPhotos || usedRegions.has(region)) continue
      usedRegions.add(region)
      matched.set(String(feature.id), regionPhotos)
    }
    return matched
  }, [photosByRegion, projectedFeatures])

  const regionShapes = React.useMemo<Array<RegionShape>>(
    () =>
      projectedFeatures.map(({ feature, center, geoCenter }) => ({
        id: String(feature.id),
        province: feature.properties?.province as string | undefined,
        center,
        geoCenter,
        photos: photosByFeature.get(String(feature.id)) ?? [],
      })),
    [photosByFeature, projectedFeatures]
  )

  const cityMarkers = React.useMemo<Array<RecapMarker>>(
    () =>
      regionShapes.flatMap(
        ({ id, center, geoCenter, photos: regionPhotos }) => {
          if (regionPhotos.length === 0 || !center || !geoCenter) return []
          const trips = groupTrips(regionPhotos)
          const photo = trips[0]?.photos.at(-1)
          const keyword = findKeyword(photo?.keyword)
          if (!keyword) return []
          return [
            {
              key: id,
              keyword,
              count: trips.length,
              position: center,
              geoPosition: geoCenter,
            },
          ]
        }
      ),
    [regionShapes]
  )

  const provinceAggregates = React.useMemo(
    () => buildProvinceAggregates(regionShapes),
    [regionShapes]
  )

  const useProvinceView =
    photosByFeature.size > 0 &&
    photosByFeature.size <= PROVINCE_AGGREGATE_MAX_REGIONS &&
    provinceAggregates.length > 0

  const markers = React.useMemo<Array<RecapMarker>>(() => {
    if (!useProvinceView) return cityMarkers
    return provinceAggregates.flatMap((aggregate) => {
      const keyword = findKeyword(aggregate.keyword)
      if (!keyword) return []
      return [
        {
          key: `province-${aggregate.province}`,
          keyword,
          count: aggregate.regionCount,
          label: `${formatProvinceBadgeName(aggregate.province)}+${aggregate.regionCount}`,
          position: aggregate.position,
          geoPosition: aggregate.geoPosition,
        },
      ]
    })
  }, [cityMarkers, provinceAggregates, useProvinceView])

  // 도 단위 모드에선 도 전체를 대표 키워드 색으로 칠한다 (시안 3229-11008)
  const fillKeywords = React.useMemo(() => {
    const fills = new Map<string, TravelKeyword>()
    if (useProvinceView) {
      for (const aggregate of provinceAggregates) {
        const keyword = findKeyword(aggregate.keyword)
        if (!keyword) continue
        for (const region of aggregate.regions) fills.set(region, keyword)
      }
      return fills
    }
    for (const [id, regionPhotos] of photosByFeature) {
      const keyword = findKeyword(regionPhotos.at(-1)?.keyword)
      if (keyword) fills.set(id, keyword)
    }
    return fills
  }, [photosByFeature, provinceAggregates, useProvinceView])

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
            fillKeywords={fillKeywords}
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
          const keyword = fillKeywords.get(String(feature.id))
          return (
            <path
              key={`${String(feature.id)}-${index}`}
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
        {markers.map(({ key, keyword, count, label, position }) => {
          const markerX = position[0] - MARKER_ANCHOR.x
          const markerY = position[1] - MARKER_ANCHOR.y
          const badgeWidth = count > 9 ? 16 : 13.7
          const labelWidth = label
            ? estimateTextWidth(label, PROVINCE_LABEL.fontSize) +
              PROVINCE_LABEL.paddingX * 2
            : 0
          return (
            <g key={key} transform={`translate(${markerX} ${markerY})`}>
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
              {label ? (
                <g
                  transform={`translate(${MARKER_ANCHOR.x - labelWidth / 2} ${MARKER_ANCHOR.y + PROVINCE_LABEL.gap})`}
                >
                  <rect
                    width={labelWidth}
                    height={PROVINCE_LABEL.height}
                    rx={PROVINCE_LABEL.height / 2}
                    fill={keyword.mapColor}
                  />
                  <text
                    x={labelWidth / 2}
                    y={
                      PROVINCE_LABEL.height / 2 + PROVINCE_LABEL.fontSize * 0.36
                    }
                    textAnchor="middle"
                    fill="white"
                    fontSize={PROVINCE_LABEL.fontSize}
                    fontWeight="500"
                  >
                    {label}
                  </text>
                </g>
              ) : count > 1 ? (
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
