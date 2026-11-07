import { afterEach, describe, expect, it, vi } from "vitest"
import { copyText } from "./copy-text"
import { openModal } from "./modal"
import { showToast } from "./toast"

vi.mock("./modal", () => ({ openModal: vi.fn() }))
vi.mock("./toast", () => ({ showToast: vi.fn() }))

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe("copyText", () => {
  it("only reports success after clipboard write succeeds", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal("navigator", { clipboard: { writeText } })
    await copyText("abc123", "복사됐어요", "bottom-[106px]")
    expect(writeText).toHaveBeenCalledWith("abc123")
    expect(showToast).toHaveBeenCalledWith({
      message: "복사됐어요",
      icon: "check",
      className: "bottom-[106px]",
    })
    expect(openModal).not.toHaveBeenCalled()
  })

  it.each([
    undefined,
    { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
  ])(
    "offers manual copy without a success toast when unavailable or denied",
    async (clipboard) => {
      vi.stubGlobal("navigator", { clipboard })
      await copyText("abc123", "복사됐어요")
      expect(openModal).toHaveBeenCalledOnce()
      expect(showToast).not.toHaveBeenCalled()
    }
  )
})
