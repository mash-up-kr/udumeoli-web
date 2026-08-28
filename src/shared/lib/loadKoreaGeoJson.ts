import { feature as toFeature, merge as toMerge } from "topojson-client"
import type { Topology } from "topojson-specification"

// 지도 라이브러리 무관 — TopoJSON 두 개를 병합해 시군구 GeoJSON FeatureCollection 생성.
// MapLibre/Google Maps 구현 공용.

// 빌드타임 산출물 (scripts/build-korea-topo.mjs) — 외부 CDN 원본을 미리 받아
// 단순화·재양자화해 굽는다. 런타임엔 같은 오리진에서 1회만 받고, 무거운
// presimplify/simplify는 이미 끝나 있다.
const KOREA_TOPO_URL = "/korea-topo.json"

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

export type KoreaGeo = {
  /** 시군구(구 병합 시 포함) — 지역 인터랙션·색칠용 */
  municipalities: GeoJSON.FeatureCollection
  /** 시도 경계 — 전국(1단계) 뷰 경계선용 */
  provinces: GeoJSON.FeatureCollection
  /** 대한민국 외곽선(시도 전체 union) — 국가(0단계) 뷰 경계선용 */
  nation: GeoJSON.Feature
}

// 결과는 순수 함수라 한 번만 만들면 된다 — 지도↔앨범 왕복이나 StrictMode 이중 마운트마다
// 다시 받고 다시 병합하지 않도록 promise를 모듈 스코프에 잡아둔다.
// 실패한 promise는 남기지 않아 다음 호출이 재시도할 수 있다.
let cached: Promise<KoreaGeo> | null = null

export function loadKoreaGeoJson(): Promise<KoreaGeo> {
  cached ??= buildKoreaGeoJson().catch((e: unknown) => {
    cached = null
    throw e
  })
  return cached
}

async function buildKoreaGeoJson(): Promise<KoreaGeo> {
  const res = await fetch(KOREA_TOPO_URL)
  if (!res.ok) {
    throw new Error(`지도 데이터 로드 실패 (${res.status} ${res.statusText})`)
  }
  const { municipalities: muniTopo, provinces: provTopo } =
    (await res.json()) as {
      municipalities: Topology
      provinces: Topology
    }

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
  // 광역시 시도 경계는 소속 군(기장·달성·강화·옹진·울주)까지 포함한다 — 그대로 쓰면
  // 군이 별도 feature(투명)로 위에 얹혀 광역시만 칠해도 군 영역에 색이 비친다.
  // 군을 뺀 소속 구들만 merge해 광역시 폴리곤을 만든다 (소속 구가 없으면 시도 경계 fallback)
  const cityFeatures = provRaw.features
    .filter((f) => METRO_CITIES.has(f.properties?.name as string))
    .map((f): GeoJSON.Feature => {
      const provCode = String(f.properties?.code)
      const geoms = muniGeoms.filter((geom) => {
        const name = geom.properties.name as string | undefined
        return (
          String(geom.properties.code).slice(0, 2) === provCode &&
          !name?.endsWith("군")
        )
      })
      if (geoms.length === 0) return f
      return {
        type: "Feature",
        geometry: toMerge(muniTopo, geoms as Parameters<typeof toMerge>[1]),
        properties: {
          name: f.properties?.name,
          code: geoms[0].properties.code,
        },
      }
    })

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

  // 상위 행정 단위 경계선용 지오메트리 — 시도는 원본 그대로, 국가는 시도 전체 union.
  // 광역시 feature는 municipalities와 객체를 공유하지만 sanitizeRings는 멱등이라 무해
  const provinces: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: provRaw.features,
  }
  provinces.features.forEach(sanitizeRings)

  const provGeoms = (
    provTopo.objects[provKey] as {
      geometries: Array<{ properties: Record<string, unknown> }>
    }
  ).geometries
  const nation: GeoJSON.Feature = {
    type: "Feature",
    geometry: toMerge(provTopo, provGeoms as Parameters<typeof toMerge>[1]),
    properties: { name: "대한민국" },
  }
  sanitizeRings(nation)

  return { municipalities: geojson, provinces, nation }
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
