// 지도 뷰포트 박스 계산 — 화면 밖 마커의 AdvancedMarker DOM 생성을 막기 위한 순수 함수들.
//
// ponytail: 한국 전용이라 날짜변경선(west > east) 래핑은 다루지 않는다.
// 다른 권역을 지원하게 되면 경도 비교를 래핑 처리로 바꿔야 한다.

export type LatLngBox = {
  south: number
  west: number
  north: number
  east: number
}

/**
 * 뷰포트를 가로·세로 각각 `ratio`만큼 넓힌 박스.
 * 화면 경계에서 마커가 툭 사라지거나 나타나는 걸 막는 버퍼다.
 */
export function expandBox(box: LatLngBox, ratio: number): LatLngBox {
  const latPad = (box.north - box.south) * ratio
  const lngPad = (box.east - box.west) * ratio
  return {
    south: box.south - latPad,
    west: box.west - lngPad,
    north: box.north + latPad,
    east: box.east + lngPad,
  }
}

export function isInsideBox(
  box: LatLngBox,
  point: { lat: number; lng: number }
): boolean {
  return (
    point.lat >= box.south &&
    point.lat <= box.north &&
    point.lng >= box.west &&
    point.lng <= box.east
  )
}

/** 같은 박스면 이전 참조를 유지해 idle마다 마커가 리렌더되는 것을 막는다 */
export function isSameBox(a: LatLngBox | null, b: LatLngBox | null): boolean {
  if (a === b) return true
  if (!a || !b) return false
  return (
    a.south === b.south &&
    a.west === b.west &&
    a.north === b.north &&
    a.east === b.east
  )
}
