// 인원수별(1~6) 파티 슬롯 배치 — Figma 5_1명~5_6명 프레임 실측 (가로 115px·세로 124px 그리드).
// 마지막 자리가 내 슬롯(우하단) — 아래 "내 사진 올리기" 툴팁이 가려지지 않도록.
// 지역이 화면 중앙에 고정된 상태 기준 화면 좌표(px). 7명 이상은 원형 분포 fallback.
const SLOT_LAYOUTS: Record<number, Array<[number, number]>> = {
  1: [[0, -8]],
  2: [
    [-57, 16],
    [58, 16],
  ],
  // 3명은 삼각형 배치 — 상단 중앙 1개 + 하단 2개, 내 슬롯 우하단 (Figma 1254-11705,
  // 하단 간격은 다른 인원수 배치와 동일한 115px 그리드로 확대)
  3: [
    [0, -46],
    [-57, 78],
    [58, 78],
  ],
  4: [
    [-57, -46],
    [58, -46],
    [-57, 78],
    [58, 78],
  ],
  5: [
    [-57, -46],
    [58, -46],
    [-115, 78],
    [0, 78],
    [115, 78],
  ],
  // 6명은 양끝 열이 위(-28)/아래(+20)로 어긋난 지그재그 배치 (Figma 1254-11461)
  6: [
    [-97, -74],
    [0, -46],
    [109, -74],
    [-97, 98],
    [0, 78],
    [109, 98],
  ],
}

export function partySlotOffset(
  total: number,
  index: number
): [number, number] {
  const layout = SLOT_LAYOUTS[total] as Array<[number, number]> | undefined
  if (layout) return layout[index]
  const radius = total <= 5 ? 116 : 132
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2
  return [Math.cos(angle) * radius, Math.sin(angle) * radius]
}
