import { feature as toFeature, merge as toMerge } from "topojson-client"
import { presimplify, quantile, simplify } from "topojson-simplify"
import type { Objects, Topology } from "topojson-specification"

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

// 원본(-simple)도 시군구 전체 ~5.5만 정점이라, 지도 라이브러리가 줌/팬 중 매 프레임
// 다시 그리기엔 과하다. 공유 경계(arc) 단위로 절반 수준까지 추가 단순화 —
// 인접 지역 사이 틈이 생기지 않고, 모바일 최대 줌(9.5)에선 시각 차이가 거의 없다.
const SIMPLIFY_RETAIN = 0.5

function simplifyTopo(topo: Topology): Topology {
  // @types/topojson-simplify 시그니처가 properties의 null을 허용하지 않아 재단언 —
  // 단순화는 arcs만 다루고 properties는 건드리지 않는다
  const pre = presimplify(topo as Topology<Objects<{}>>)
  return simplify(pre, quantile(pre, SIMPLIFY_RETAIN))
}

export async function loadKoreaGeoJson(): Promise<GeoJSON.FeatureCollection> {
  const [muniTopoRaw, provTopoRaw]: [Topology, Topology] = await Promise.all([
    fetch(MUNICIPALITIES_URL).then((r) => r.json()),
    fetch(PROVINCES_URL).then((r) => r.json()),
  ])
  const muniTopo = simplifyTopo(muniTopoRaw)
  const provTopo = simplifyTopo(provTopoRaw)

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
      // code는 도 매핑용으로 유지 — kostat 코드 앞 2자리가 도 코드
      properties: { name: cityName, code: geoms[0]?.properties.code },
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

  // 시군구 → 도 매핑 (kostat 코드 앞 2자리 = 도 코드, 광역시는 자기 자신이 도)
  const codeToProvince = new Map<string, string>()
  for (const f of provRaw.features) {
    const code = f.properties?.code
    const name = f.properties?.name
    if (code != null && typeof name === "string") {
      codeToProvince.set(String(code), name)
    }
  }

  const geojson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [...cityFeatures, ...mergedCityFeatures, ...gunFeatures],
  }
  geojson.features.forEach((f, i) => {
    f.id = i
    // 외부 데이터라 code가 없을 수 있다 — 그 경우 province 없이 두면
    // 소비자(도 단위 집계)에서 해당 지역만 집계에서 빠진다
    const code = f.properties?.code
    const province =
      code != null ? codeToProvince.get(String(code).slice(0, 2)) : undefined
    if (province && f.properties) f.properties.province = province
    sanitizeRings(f)
  })
  return geojson
}

// Google Maps data.addGeoJson()은 GeoJSON 스펙(링 폐합, 4점 이상)을 엄격 검증해
// InvalidValueError를 던지므로 (MapLibre는 관대):
// - topojson merge()가 만드는 열린 링은 첫 좌표를 복제해 닫는다
// - 단순화로 퇴화한 링(서로 다른 점 3개 미만 — 이 줌에선 서브픽셀인 초소형 섬)은
//   버린다. 그리기 패스도 함께 줄어든다 (전체 지역이 사라지는 경우는 없음을 실측 확인)
function sanitizeRings(feature: GeoJSON.Feature) {
  const g = feature.geometry
  if (g.type === "Polygon") {
    g.coordinates = cleanPolygon(g.coordinates)
  } else if (g.type === "MultiPolygon") {
    g.coordinates = g.coordinates
      .map(cleanPolygon)
      .filter((poly) => poly.length > 0)
  }
}

function cleanPolygon(
  poly: Array<Array<GeoJSON.Position>>
): Array<Array<GeoJSON.Position>> {
  const rings = poly.filter(
    (ring) => new Set(ring.map(([x, y]) => `${x},${y}`)).size >= 3
  )
  // 외곽 링(첫 번째)이 퇴화했으면 남은 구멍 링이 외곽으로 오인되므로 폴리곤 전체를 버린다
  if (rings.length > 0 && rings[0] !== poly[0]) return []
  for (const ring of rings) {
    const first = ring[0]
    const last = ring[ring.length - 1]
    if (first[0] !== last[0] || first[1] !== last[1]) {
      ring.push([first[0], first[1]])
    }
  }
  return rings
}
