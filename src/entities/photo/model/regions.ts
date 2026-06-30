// 지역명 -> 대표 좌표 (러프: 새 사진 등록 시 핀 위치 산정용)
export const REGION_CENTERS: Record<string, { lat: number; lng: number }> = {
  서울: { lat: 37.5665, lng: 126.978 },
  강릉: { lat: 37.7519, lng: 128.8761 },
  대전: { lat: 36.3504, lng: 127.3845 },
  부산: { lat: 35.1796, lng: 129.0756 },
  경주: { lat: 35.8562, lng: 129.2247 },
  광주: { lat: 35.1595, lng: 126.8526 },
  제주: { lat: 33.4996, lng: 126.5312 },
}
