import { describe, expect, it, vi } from "vitest"
import { overlay } from "overlay-kit"
import { showToast } from "./toast"

vi.mock("overlay-kit", () => ({ overlay: { open: vi.fn() } }))

describe("showToast", () => {
  it("merges duplicates and shows different messages in order", () => {
    showToast({ message: "첫 번째" })
    showToast({ message: "첫 번째" })
    showToast({ message: "두 번째", icon: "alert" })
    expect(overlay.open).toHaveBeenCalledOnce()

    const unmount = vi.fn()
    const renderFirst = vi.mocked(overlay.open).mock.calls[0][0]
    const first = renderFirst({
      overlayId: "first",
      isOpen: true,
      close: vi.fn(),
      unmount,
    })
    // The controller returns the Toast element; invoking its dismissal simulates timeout.
    if (!first || typeof first !== "object" || !("props" in first))
      throw new Error("Missing toast")
    const firstProps = first.props as { message: string; onDismiss: () => void }
    expect(firstProps.message).toBe("첫 번째")
    firstProps.onDismiss()
    expect(unmount).toHaveBeenCalledOnce()
    expect(overlay.open).toHaveBeenCalledTimes(2)

    const renderSecond = vi.mocked(overlay.open).mock.calls[1][0]
    const second = renderSecond({
      overlayId: "second",
      isOpen: true,
      close: vi.fn(),
      unmount,
    })
    if (!second || typeof second !== "object" || !("props" in second))
      throw new Error("Missing toast")
    const secondProps = second.props as {
      message: string
      onDismiss: () => void
    }
    expect(secondProps.message).toBe("두 번째")
    secondProps.onDismiss()
    // Dismissing an old controller again must not consume another queued message.
    firstProps.onDismiss()
    expect(overlay.open).toHaveBeenCalledTimes(2)
  })
})
