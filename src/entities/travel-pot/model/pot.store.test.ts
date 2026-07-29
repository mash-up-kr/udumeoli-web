import { describe, expect, it } from "vitest"

import { selectCurrentPotMembers, usePotStore } from "./pot.store"

describe("selectCurrentPotMembers", () => {
  it("팟이 없을 때 호출마다 같은 참조를 반환한다 (무한 리렌더 방지)", () => {
    usePotStore.setState({ pots: [], currentPotId: "" })
    const state = usePotStore.getState()
    expect(selectCurrentPotMembers(state)).toBe(selectCurrentPotMembers(state))
  })

  it("현재 선택된 팟의 members를 그대로 반환한다", () => {
    usePotStore.getState().seedUtPots()
    const state = usePotStore.getState()
    const current = state.pots.find((p) => p.id === state.currentPotId)
    expect(selectCurrentPotMembers(state)).toBe(current?.members)
  })
})

describe("초기 상태", () => {
  it("팟이 하나도 없는 상태로 시작한다 (/pot-start 진입 대상)", () => {
    usePotStore.getState().resetPots()
    const state = usePotStore.getState()
    expect(state.pots).toHaveLength(0)
    expect(state.currentPotId).toBe("")
  })
})

describe("seedUtPots", () => {
  it("UT 팟 3개가 추가되고 각 팟은 나 포함 4인이다", () => {
    usePotStore.getState().resetPots()
    usePotStore.getState().seedUtPots()
    const state = usePotStore.getState()
    expect(state.pots).toHaveLength(3)
    for (const pot of state.pots) {
      expect(pot.members).toHaveLength(4)
      expect(pot.members.some((m) => m.id === "user-1")).toBe(true)
    }
  })
})

describe("resetPots", () => {
  it("시드 이후에도 팟 없는 초기 상태로 되돌린다 (계정 삭제)", () => {
    usePotStore.getState().seedUtPots()
    usePotStore.getState().resetPots()
    const state = usePotStore.getState()
    expect(state.pots).toHaveLength(0)
    expect(state.currentPotId).toBe("")
  })
})
