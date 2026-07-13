/**
 * 지역명 표시용 포맷 — 행정 접미사(시/군/구, 특별시/광역시 등)를 뗀다.
 * 데이터 키(geojson feature name)는 풀네임을 유지하고 표시할 때만 사용.
 * ex. "강릉시" → "강릉", "서울특별시" → "서울", "고성군" → "고성"
 */
export function formatRegionName(name: string): string {
  return name.replace(/(특별자치시|특별자치도|특별시|광역시|[시군구])$/, "")
}
