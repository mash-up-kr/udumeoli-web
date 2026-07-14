import { feature as toFeature, merge as toMerge } from "topojson-client"
import type { Topology } from "topojson-specification"

// 지도 라이브러리 무관 — TopoJSON 원본 두 개를 병합해 시군구 GeoJSON FeatureCollection 생성.
// MapLibre/Google Maps 구현 공용.

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

export async function loadKoreaGeoJson(): Promise<GeoJSON.FeatureCollection> {
  const [muniTopo, provTopo]: [Topology, Topology] = await Promise.all([
    fetch(MUNICIPALITIES_URL).then((r) => r.json()),
    fetch(PROVINCES_URL).then((r) => r.json()),
  ])

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
    const merged = toMerge(muniTopo, geoms as Parameters<typeof toMerge>[1])
    mergedCityFeatures.push({
      type: "Feature",
      geometry: merged,
      properties: { name: cityName },
    })
  }

  // 군 + 단일 시 (구 없는 시) — merge로 이미 만든 시는 원본에서 제외해 중복 방지
  const muniRaw = toFeature(
    muniTopo,
    muniTopo.objects[muniKey]
  ) as unknown as GeoJSON.FeatureCollection
  const gunFeatures = muniRaw.features.filter((f) => {
    const name = f.properties?.name as string | undefined
    if (!name || cityGroups.has(name)) return false
    return name.endsWith("군") || name.endsWith("시")
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
    closeRings(f)
  })
  return geojson
}

// topojson merge()가 만드는 링은 시작/끝 좌표가 다를 수 있다.
// MapLibre는 관대하지만 Google Maps data.addGeoJson()은 GeoJSON 스펙(링 폐합)을
// 엄격 검증해 InvalidValueError를 던지므로, 열린 링은 첫 좌표를 복제해 닫아준다.
function closeRings(feature: GeoJSON.Feature) {
  const g = feature.geometry
  const polys =
    g.type === "Polygon"
      ? [g.coordinates]
      : g.type === "MultiPolygon"
        ? g.coordinates
        : []
  for (const poly of polys) {
    for (const ring of poly) {
      const first = ring[0]
      const last = ring[ring.length - 1]
      if (first[0] !== last[0] || first[1] !== last[1]) {
        ring.push([first[0], first[1]])
      }
    }
  }
}
