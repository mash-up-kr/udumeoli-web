// GeoJSON 폴리곤 순수 계산 유틸 — 지도 라이브러리 무관 (MapLibre/Google Maps 공용)

// 폴리곤 면적 가중 centroid (shoelace) — bbox 중심과 달리 오목한 해안선에서도 도형 내부에 안착
function ringCentroid(
  ring: Array<Array<number>>
): { center: [number, number]; area: number } | null {
  let area = 0
  let cx = 0
  let cy = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const [x0, y0] = ring[i]
    const [x1, y1] = ring[i + 1]
    const cross = x0 * y1 - x1 * y0
    area += cross
    cx += (x0 + x1) * cross
    cy += (y0 + y1) * cross
  }
  area /= 2
  if (area === 0) return null
  return { center: [cx / (6 * area), cy / (6 * area)], area: Math.abs(area) }
}

export function computeCentroid(
  feature: GeoJSON.Feature
): [number, number] | null {
  const g = feature.geometry
  let rings: Array<Array<Array<number>>> = []
  if (g.type === "Polygon") rings = [g.coordinates[0]]
  else if (g.type === "MultiPolygon") rings = g.coordinates.map((p) => p[0])
  else return null

  if (rings.length === 0) return null

  const computed = rings.map(ringCentroid).filter((r) => r !== null)
  if (computed.length === 0) return null

  // 가장 큰 폴리곤(본토) 기준
  const largest = computed.reduce((a, b) => (a.area >= b.area ? a : b))
  return largest.center
}

// 지역 폴리곤 전체 bbox — 등록 플로우 진입 시 fitBounds용
export function computeFeatureBBox(
  feature: GeoJSON.Feature
): [[number, number], [number, number]] | null {
  const g = feature.geometry
  let rings: Array<Array<Array<number>>> = []
  if (g.type === "Polygon") rings = g.coordinates
  else if (g.type === "MultiPolygon") rings = g.coordinates.flat()
  else return null
  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity
  for (const ring of rings) {
    for (const [lng, lat] of ring) {
      if (lng < minLng) minLng = lng
      if (lng > maxLng) maxLng = lng
      if (lat < minLat) minLat = lat
      if (lat > maxLat) maxLat = lat
    }
  }
  if (minLng === Infinity) return null
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ]
}

// 등간격 원형 분포 — N명을 원 위에 균등 배치, 겹치지 않음
export function getSlotOffset(total: number, index: number): [number, number] {
  if (total === 1) return [0, 0]
  const radius = total <= 3 ? 64 : total <= 6 ? 80 : 96
  // 12시 방향 시작
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2
  return [Math.cos(angle) * radius, Math.sin(angle) * radius]
}
