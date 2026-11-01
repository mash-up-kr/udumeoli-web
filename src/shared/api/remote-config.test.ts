// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { getFirebaseAppMock, fetchAndActivateMock, getValueMock } = vi.hoisted(
  () => ({
    getFirebaseAppMock: vi.fn(),
    fetchAndActivateMock: vi.fn(),
    getValueMock: vi.fn(),
  })
)

vi.mock("./firebase", () => ({ getFirebaseApp: getFirebaseAppMock }))
vi.mock("firebase/remote-config", () => ({
  getRemoteConfig: () => ({ settings: {} }),
  fetchAndActivate: fetchAndActivateMock,
  getValue: getValueMock,
}))

async function loadModule() {
  vi.resetModules()
  return import("./remote-config")
}

function remoteValue(source: "remote" | "default" | "static", value = "") {
  return { getSource: () => source, asString: () => value }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe("remote config", () => {
  beforeEach(() => {
    getFirebaseAppMock.mockReturnValue({})
    fetchAndActivateMock.mockResolvedValue(true)
    getValueMock.mockReturnValue(remoteValue("remote", "treatment"))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("returns the default and never fetches when Firebase is not configured", async () => {
    getFirebaseAppMock.mockReturnValue(null)
    const { initializeRemoteConfig, getRemoteConfigValue } = await loadModule()

    initializeRemoteConfig()

    expect(fetchAndActivateMock).not.toHaveBeenCalled()
    expect(getRemoteConfigValue("variant", "control")).toBe("control")
  })

  it("returns the default until activation, then the remote value", async () => {
    let resolveFetch: (value: boolean) => void = () => {}
    fetchAndActivateMock.mockReturnValue(
      new Promise<boolean>((resolve) => {
        resolveFetch = resolve
      })
    )
    const { initializeRemoteConfig, getRemoteConfigValue } = await loadModule()

    initializeRemoteConfig()
    initializeRemoteConfig()
    expect(fetchAndActivateMock).toHaveBeenCalledTimes(1)
    expect(getRemoteConfigValue("variant", "control")).toBe("control")

    resolveFetch(true)
    await flush()
    expect(getRemoteConfigValue("variant", "control")).toBe("treatment")
  })

  it.each(["default", "static"] as const)(
    "falls back to the default when the value source is %s",
    async (source) => {
      getValueMock.mockReturnValue(remoteValue(source, "ignored"))
      const { initializeRemoteConfig, getRemoteConfigValue } =
        await loadModule()

      initializeRemoteConfig()
      await flush()

      expect(getRemoteConfigValue("variant", "control")).toBe("control")
    }
  )

  it("keeps serving values when the fetch fails", async () => {
    fetchAndActivateMock.mockRejectedValue(new Error("offline"))
    getValueMock.mockReturnValue(remoteValue("remote", "cached"))
    const { initializeRemoteConfig, getRemoteConfigValue } = await loadModule()

    expect(initializeRemoteConfig).not.toThrow()
    await flush()

    expect(getRemoteConfigValue("variant", "control")).toBe("cached")
  })
})
