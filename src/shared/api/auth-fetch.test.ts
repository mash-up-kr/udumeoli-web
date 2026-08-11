// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { authFetch } from "./auth-fetch"
import { getAccessToken, getRefreshToken, setTokens } from "./token-storage"

function jsonResponse(status: number, body: unknown = {}) {
  return new Response(JSON.stringify(body), { status })
}

describe("authFetch", () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock)
    window.localStorage.clear()
    setTokens({ accessToken: "old-access", refreshToken: "old-refresh" })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    fetchMock.mockReset()
  })

  it("401이면 refresh 후 새 Bearer로 1회 재시도한다", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401)) // 원 요청
      .mockResolvedValueOnce(
        jsonResponse(200, {
          accessToken: "new-access",
          refreshToken: "new-refresh",
        })
      ) // refresh
      .mockResolvedValueOnce(jsonResponse(200, { data: {} })) // 재시도

    const res = await authFetch("/graphql", {
      method: "POST",
      headers: { Authorization: "Bearer old-access" },
    })

    expect(res.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(3)
    const retryInit = fetchMock.mock.calls[2][1]
    expect(new Headers(retryInit?.headers).get("Authorization")).toBe(
      "Bearer new-access"
    )
    expect(getRefreshToken()).toBe("new-refresh") // rotating 반영
  })

  it("동시 401은 refresh를 한 번만 탄다", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401))
      .mockResolvedValueOnce(jsonResponse(401))
      .mockResolvedValueOnce(
        jsonResponse(200, { accessToken: "a2", refreshToken: "r2" })
      )
      .mockResolvedValue(jsonResponse(200, { data: {} }))

    await Promise.all([authFetch("/graphql"), authFetch("/graphql")])

    const refreshCalls = fetchMock.mock.calls.filter(([url]) =>
      String(url).includes("/api/auth/refresh")
    )
    expect(refreshCalls).toHaveLength(1)
  })

  it("refresh가 401이면 토큰을 지우고 원 401을 반환한다", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401))
      .mockResolvedValueOnce(jsonResponse(401, { code: "INVALID_TOKEN" }))

    const res = await authFetch("/graphql")

    expect(res.status).toBe(401)
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })
})
