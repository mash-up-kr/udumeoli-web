// 상위 행정 경계선(국가/시도) 갱신 판단 — idle마다 province feature 전체를 다시
// 스타일링하지 않도록, 실제로 바뀐 것이 있을 때만 작업하게 한다.

export type BoundarySnapshot = {
  stage: 0 | 1 | 2 | 3
  /** 기록이 있는 도 집합의 정렬된 키 */
  recordedProvinceKey: string
  hasNationRecord: boolean
}

export type BoundarySyncPlan = {
  /** 바뀐 게 없어 레이어를 건드릴 필요가 없다 */
  skip: boolean
  /** province feature 전체 순회가 필요한지 — 기록된 도 집합이 바뀐 경우만 */
  restyleProvinces: boolean
}

/** Set 순서에 흔들리지 않는 비교용 키 */
export function recordedProvinceKey(provinces: Iterable<string>): string {
  return [...provinces].sort().join(",")
}

export function planBoundarySync(
  prev: BoundarySnapshot | null,
  next: BoundarySnapshot
): BoundarySyncPlan {
  if (!prev) return { skip: false, restyleProvinces: true }

  const restyleProvinces = prev.recordedProvinceKey !== next.recordedProvinceKey
  const skip =
    !restyleProvinces &&
    prev.stage === next.stage &&
    prev.hasNationRecord === next.hasNationRecord

  return { skip, restyleProvinces }
}
