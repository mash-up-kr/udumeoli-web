import { beforeEach, describe, expect, it, vi } from "vitest"
import { confirmBlockAuthor } from "./confirm-block-author"

const { confirm, block, toast, session } = vi.hoisted(() => ({
  confirm: vi.fn(),
  block: vi.fn(),
  toast: vi.fn(),
  session: { currentUser: { id: "me" } },
}))
vi.mock("@/shared/ui/modal", () => ({ openConfirm: confirm }))
vi.mock("@/shared/ui/toast", () => ({ showToast: toast }))
vi.mock("@/entities/photo", () => ({
  useBlockedAuthorStore: { getState: () => ({ block }) },
}))
vi.mock("@/entities/user", () => ({
  useSessionStore: { getState: () => session },
}))

beforeEach(() => {
  vi.resetAllMocks()
  session.currentUser = { id: "me" }
})
describe("차단 확인 흐름", () => {
  it("취소하면 저장하지 않는다", async () => {
    confirm.mockResolvedValue(false)
    expect(
      await confirmBlockAuthor("me", { id: "other", nickname: "팟원" })
    ).toBe(false)
    expect(block).not.toHaveBeenCalled()
  })
  it("확인 중 계정이 바뀌면 저장하지 않는다", async () => {
    confirm.mockImplementation(() => {
      session.currentUser = { id: "another" }
      return Promise.resolve(true)
    })
    expect(
      await confirmBlockAuthor("me", { id: "other", nickname: "팟원" })
    ).toBe(false)
    expect(block).not.toHaveBeenCalled()
  })
  it("저장 실패를 성공으로 표시하지 않는다", async () => {
    confirm.mockResolvedValue(true)
    block.mockImplementation(() => {
      throw new Error("denied")
    })
    expect(
      await confirmBlockAuthor("me", { id: "other", nickname: "팟원" })
    ).toBe(false)
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "alert" })
    )
  })
})
