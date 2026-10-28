export const APP_LOGIN_MARKER = "pinnned:app-login-started-at"
export const APP_LOGIN_SCHEME = "pinnned"

// 제공자 인증은 코드 발급 전에 오래 걸릴 수 있다. 오래된 앱 로그인 표시만 제외한다.
export function isAppLoginPending(
  value: string | null,
  now = Date.now()
): boolean {
  const startedAt = Number(value)
  return (
    value !== null &&
    startedAt > 0 &&
    now >= startedAt &&
    now - startedAt < 900_000
  )
}
