// 백엔드가 토큰을 쿠키가 아닌 JSON 바디로 내려주므로 프론트가 직접 보관한다.
// gqlClient(shared)가 읽어야 해서 FSD 상향 의존 금지에 따라 shared에 둔다.
const ACCESS_KEY = "udumeoli:access-token"
const REFRESH_KEY = "udumeoli:refresh-token"

// SSR에선 window가 없다 — 토큰이 필요한 호출은 전부 클라이언트에서만 일어난다
function storage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage
}

export function getAccessToken(): string | null {
  return storage()?.getItem(ACCESS_KEY) ?? null
}

export function getRefreshToken(): string | null {
  return storage()?.getItem(REFRESH_KEY) ?? null
}

export function setTokens(tokens: {
  accessToken: string
  refreshToken: string
}): void {
  storage()?.setItem(ACCESS_KEY, tokens.accessToken)
  storage()?.setItem(REFRESH_KEY, tokens.refreshToken)
}

export function clearTokens(): void {
  storage()?.removeItem(ACCESS_KEY)
  storage()?.removeItem(REFRESH_KEY)
}
