import { getAccessToken, getRefreshToken } from "./token-storage"
import { refreshTokens } from "./token-refresh"

/** gqlClient용 fetch — accessToken 만료(401) 시 refresh 후 Bearer를 갈아끼워 1회 재시도. */
export const authFetch: typeof fetch = async (input, init) => {
  const res = await fetch(input, init)
  if (res.status !== 401 || !getRefreshToken()) return res

  const refreshed = await refreshTokens()
  if (!refreshed) return res

  const headers = new Headers(init?.headers)
  headers.set("Authorization", `Bearer ${getAccessToken()}`)
  return fetch(input, { ...init, headers })
}
