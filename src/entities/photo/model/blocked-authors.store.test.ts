import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  readBlockedAuthors,
  useBlockedAuthorStore,
} from "./blocked-authors.store"

const author = { id: "other", nickname: "팟원" }
beforeEach(() => {
  const storage = new Map<string, string>()
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value)
    },
  })
  useBlockedAuthorStore.setState({ accounts: {}, errors: {} })
})
describe("기기 내 작성자 차단", () => {
  it("계정별로 저장하고 재로드하며 중복 차단과 해제를 처리한다", () => {
    const { block, unblock, load } = useBlockedAuthorStore.getState()
    block("me", author)
    block("me", author)
    expect(readBlockedAuthors("me")).toEqual([author])
    expect(readBlockedAuthors("another-account")).toEqual([])
    useBlockedAuthorStore.setState({ accounts: {} })
    load("me")
    expect(useBlockedAuthorStore.getState().accounts.me).toEqual([author])
    unblock("me", author.id)
    expect(readBlockedAuthors("me")).toEqual([])
    expect(useBlockedAuthorStore.getState().accounts.me).toEqual([])
  })
  it("본인 차단을 거절한다", () => {
    expect(() =>
      useBlockedAuthorStore.getState().block("other", author)
    ).toThrow()
    expect(readBlockedAuthors("other")).toEqual([])
  })
  it("저장이 거부되면 차단·해제 상태를 바꾸지 않는다", () => {
    useBlockedAuthorStore.getState().block("me", author)
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("denied")
    })
    expect(() =>
      useBlockedAuthorStore.getState().unblock("me", author.id)
    ).toThrow()
    expect(useBlockedAuthorStore.getState().accounts.me).toEqual([author])
    expect(() =>
      useBlockedAuthorStore
        .getState()
        .block("me", { id: "new", nickname: "새 멤버" })
    ).toThrow()
    expect(useBlockedAuthorStore.getState().accounts.me).toEqual([author])
  })
  it.each(["not json", "{}", '[{"id":12,"nickname":"bad"}]'])(
    "손상된 저장소를 성공으로 취급하거나 덮어쓰지 않는다: %s",
    (value) => {
      localStorage.setItem("pinnned-blocked-authors:me", value)
      useBlockedAuthorStore.getState().load("me")
      expect(useBlockedAuthorStore.getState().errors.me).toBe(true)
      expect(() =>
        useBlockedAuthorStore.getState().block("me", author)
      ).toThrow()
      expect(localStorage.getItem("pinnned-blocked-authors:me")).toBe(value)
    }
  )
})
