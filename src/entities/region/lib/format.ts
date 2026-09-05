/**
 * 지역명 표시용 포맷 — 행정 접미사(시/군/구, 특별시/광역시 등)를 뗀다.
 * 데이터 키(geojson feature name)는 풀네임을 유지하고 표시할 때만 사용.
 * ex. "강릉시" → "강릉", "서울특별시" → "서울", "고성군" → "고성"
 */
export function formatRegionName(name: string): string {
  return name.replace(/(특별자치시|특별자치도|특별시|광역시|[시군구])$/, "")
}

/** 도(광역시 포함) 뱃지 표시명 — 접미사를 뗀 축약형. ex. "강원특별자치도" → "강원" */
const PROVINCE_BADGE_LABELS: Record<string, string> = {
  서울특별시: "서울",
  부산광역시: "부산",
  대구광역시: "대구",
  인천광역시: "인천",
  광주광역시: "광주",
  대전광역시: "대전",
  울산광역시: "울산",
  세종특별자치시: "세종",
  경기도: "경기",
  강원도: "강원",
  강원특별자치도: "강원",
  충청북도: "충북",
  충청남도: "충남",
  전라북도: "전북",
  전북특별자치도: "전북",
  전라남도: "전남",
  경상북도: "경북",
  경상남도: "경남",
  제주특별자치도: "제주",
}

export function formatProvinceBadgeName(province: string): string {
  return PROVINCE_BADGE_LABELS[province] ?? formatRegionName(province)
}
