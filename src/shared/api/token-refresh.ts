import { clearTokens, getRefreshToken, setTokens } from "./token-storage"

async function doRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  let res: Response
  try {
    res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
  } catch {
    // 네트워크 오류 — 토큰 자체가 무효인 건 아니므로 지우지 않는다
    return false
  }

  if (res.status === 401) {
    // INVALID_TOKEN / USER_NOT_FOUND — 세션 종료, RequireAuth 가드가 "/"로 보낸다
    clearTokens()
    return false
  }
  if (!res.ok) return false

  const data = (await res.json()) as {
    accessToken: string
    refreshToken: string
  }
  setTokens(data)
  return true
}

let inflight: Promise<boolean> | null = null

/** refreshToken은 1회용(rotating)이라 동시 401이 나도 refresh는 한 번만 탄다. */
export function refreshTokens(): Promise<boolean> {
  inflight ??= doRefresh().finally(() => {
    inflight = null
  })
  return inflight
}
