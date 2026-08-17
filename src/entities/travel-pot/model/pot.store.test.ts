import { describe, expect, it } from "vitest"

import { ALBUM_POT, TRIP_100_POT } from "../api/pot.mock"
import {
  clearAutoDemoPotsOnly,
  getMemberPots,
  selectCurrentPotMembers,
  usePotStore,
} from "./pot.store"

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
  it("시드 이후에도 팟 없는 초기 상태로 되돌린다", () => {
    usePotStore.getState().seedUtPots()
    usePotStore.getState().resetPots()
    const state = usePotStore.getState()
    expect(state.pots).toHaveLength(0)
    expect(state.currentPotId).toBe("")
  })
})

describe("clearAutoDemoPotsOnly", () => {
  it("자동 데모 팟만 남은 persist 상태는 신규 유저 상태로 비운다", () => {
    const state = clearAutoDemoPotsOnly({
      pots: [TRIP_100_POT, ALBUM_POT],
      currentPotId: TRIP_100_POT.id,
    })

    expect(state).toEqual({ pots: [], currentPotId: "" })
  })

  it("사용자가 만든 팟이 섞인 상태는 유지한다", () => {
    const userPot = {
      id: "pot-user",
      name: "내 팟",
      inviteCode: "abc123",
      members: [{ id: "user-1", nickname: "정민", profileImageUrl: null }],
    }
    const state = clearAutoDemoPotsOnly({
      pots: [userPot, ALBUM_POT],
      currentPotId: userPot.id,
    })

    expect(state.pots.map((pot) => pot.id)).toEqual([userPot.id, ALBUM_POT.id])
    expect(state.currentPotId).toBe(userPot.id)
  })
})

describe("confirmJoin", () => {
  it("참여 확정 시 현재 유저를 멤버로 추가하고 입장 시각을 남긴다", () => {
    usePotStore.getState().resetPots()
    usePotStore.getState().confirmJoin(
      {
        id: "pot-new",
        name: "새 여행팟",
        inviteCode: "123abc",
        members: [{ id: "m-1", nickname: "친구", profileImageUrl: null }],
      },
      { id: "user-1", nickname: "정민", profileImageUrl: null }
    )

    const state = usePotStore.getState()
    expect(state.currentPotId).toBe("pot-new")
    expect(state.pots[0]?.members.some((m) => m.id === "user-1")).toBe(true)
    expect(state.pots[0]?.joinedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it("스토어에 남아 있는 탈퇴 팟은 같은 초대코드로 재입장할 수 있다", () => {
    usePotStore.setState({
      currentPotId: "",
      pots: [
        {
          id: "pot-rejoin",
          name: "재입장 팟",
          inviteCode: "abc123",
          vacantSlots: 1,
          members: [{ id: "m-1", nickname: "친구", profileImageUrl: null }],
        },
      ],
    })

    const result = usePotStore.getState().previewJoin("abc123", "user-1")
    expect(result.status).toBe("ok")
    if (result.status !== "ok") return

    usePotStore.getState().confirmJoin(result.pot, {
      id: "user-1",
      nickname: "정민",
      profileImageUrl: null,
    })

    const state = usePotStore.getState()
    expect(state.currentPotId).toBe("pot-rejoin")
    expect(state.pots[0]?.members.map((m) => m.id)).toEqual(["m-1", "user-1"])
    expect(state.pots[0]?.vacantSlots).toBe(0)
  })
})

describe("previewJoin", () => {
  it("이미 내가 속한 팟의 초대코드는 참여 중으로 처리한다", () => {
    usePotStore.setState({
      currentPotId: "pot-joined",
      pots: [
        {
          id: "pot-joined",
          name: "참여 중 팟",
          inviteCode: "joined",
          members: [{ id: "user-1", nickname: "정민", profileImageUrl: null }],
        },
      ],
    })

    expect(usePotStore.getState().previewJoin("joined", "user-1")).toEqual({
      status: "already_joined",
    })
  })
})

describe("getMemberPots", () => {
  it("특정 유저가 실제 멤버인 팟만 반환한다", () => {
    expect(
      getMemberPots(
        [
          {
            id: "pot-mine",
            name: "내 팟",
            inviteCode: "111111",
            members: [
              { id: "user-1", nickname: "정민", profileImageUrl: null },
            ],
          },
          {
            id: "pot-left",
            name: "탈퇴한 팟",
            inviteCode: "222222",
            members: [{ id: "m-1", nickname: "친구", profileImageUrl: null }],
          },
        ],
        "user-1"
      ).map((pot) => pot.id)
    ).toEqual(["pot-mine"])
  })
})

describe("leaveAllByMember", () => {
  it("멤버를 모든 팟에서 제거하고 팟은 공석 수와 함께 유지한다", () => {
    usePotStore.setState({
      currentPotId: "pot-delete",
      pots: [
        {
          id: "pot-delete",
          name: "삭제 테스트",
          inviteCode: "000111",
          joinedAt: "2026-07",
          vacantSlots: 1,
          members: [
            { id: "user-1", nickname: "정민", profileImageUrl: null },
            { id: "m-1", nickname: "친구", profileImageUrl: null },
          ],
        },
      ],
    })

    usePotStore.getState().leaveAllByMember("user-1")

    const state = usePotStore.getState()
    expect(state.pots).toHaveLength(1)
    expect(state.pots[0]?.members.map((m) => m.id)).toEqual(["m-1"])
    expect(state.pots[0]?.vacantSlots).toBe(2)
    expect(state.currentPotId).toBe("")
  })
})

describe("팟 편집", () => {
  it("팟 이름을 trim된 값으로 변경한다", () => {
    usePotStore.setState({
      currentPotId: "pot-edit",
      pots: [
        {
          id: "pot-edit",
          name: "기존 팟",
          inviteCode: "000111",
          members: [{ id: "user-1", nickname: "정민", profileImageUrl: null }],
        },
      ],
    })

    usePotStore.getState().renamePot("pot-edit", " 새 이름 ")

    expect(usePotStore.getState().pots[0]?.name).toBe("새 이름")
  })

  it("팟 삭제 시 팟과 현재 선택을 제거한다", () => {
    usePotStore.setState({
      currentPotId: "pot-delete",
      pots: [
        {
          id: "pot-delete",
          name: "삭제 팟",
          inviteCode: "000111",
          members: [{ id: "user-1", nickname: "정민", profileImageUrl: null }],
        },
      ],
    })

    usePotStore.getState().deletePot("pot-delete")

    const state = usePotStore.getState()
    expect(state.pots).toHaveLength(0)
    expect(state.currentPotId).toBe("")
  })

  it("팟장이 나가면 본인만 빠지고 다음 가입자가 첫 멤버로 남는다", () => {
    usePotStore.setState({
      currentPotId: "pot-leave",
      pots: [
        {
          id: "pot-leave",
          name: "나가기 팟",
          inviteCode: "000111",
          vacantSlots: 0,
          members: [
            { id: "user-1", nickname: "정민", profileImageUrl: null },
            { id: "m-1", nickname: "민준", profileImageUrl: null },
            { id: "m-2", nickname: "서연", profileImageUrl: null },
          ],
        },
      ],
    })

    usePotStore.getState().leavePot("pot-leave", "user-1")

    const state = usePotStore.getState()
    expect(state.pots[0]?.members.map((m) => m.id)).toEqual(["m-1", "m-2"])
    expect(state.pots[0]?.vacantSlots).toBe(1)
    expect(state.currentPotId).toBe("")
  })

  it("현재 팟을 나가도 다른 내 팟이 있으면 그 팟을 현재 선택으로 보정한다", () => {
    usePotStore.setState({
      currentPotId: "pot-leave",
      pots: [
        {
          id: "pot-leave",
          name: "나가기 팟",
          inviteCode: "000111",
          members: [
            { id: "user-1", nickname: "정민", profileImageUrl: null },
            { id: "m-1", nickname: "민준", profileImageUrl: null },
          ],
        },
        {
          id: "pot-next",
          name: "남은 팟",
          inviteCode: "000222",
          members: [{ id: "user-1", nickname: "정민", profileImageUrl: null }],
        },
      ],
    })

    usePotStore.getState().leavePot("pot-leave", "user-1")

    expect(usePotStore.getState().currentPotId).toBe("pot-next")
  })

  it("같은 이름으로 연속 생성해도 팟 id가 충돌하지 않는다", () => {
    usePotStore.getState().resetPots()

    const creator = { id: "user-1", nickname: "정민", profileImageUrl: null }
    const first = usePotStore.getState().createPot("같은 이름", creator)
    const second = usePotStore.getState().createPot("같은 이름", creator)

    expect(first.id).not.toBe(second.id)
  })
})
