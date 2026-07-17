import { describe, expect, it } from "vitest"

import { selectCurrentPotMembers, usePotStore } from "./pot.store"

describe("selectCurrentPotMembers", () => {
  it("팟이 없을 때 호출마다 같은 참조를 반환한다 (무한 리렌더 방지)", () => {
    const state = usePotStore.getState()
    expect(state.pots).toHaveLength(0)
    expect(selectCurrentPotMembers(state)).toBe(selectCurrentPotMembers(state))
  })

  it("현재 선택된 팟의 members를 그대로 반환한다", () => {
    usePotStore.getState().seedUtPot()
    const state = usePotStore.getState()
    const current = state.pots.find((p) => p.id === state.currentPotId)
    expect(selectCurrentPotMembers(state)).toBe(current?.members)
  })
})
