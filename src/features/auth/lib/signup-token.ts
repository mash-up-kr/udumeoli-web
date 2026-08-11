// signupToken(10분 유효)을 콜백 → 가입 페이지로 전달. 탭 생명주기면 충분해서 sessionStorage.
const KEY = "udumeoli:signup-token"

export function setSignupToken(token: string): void {
  window.sessionStorage.setItem(KEY, token)
}

export function getSignupToken(): string | null {
  return window.sessionStorage.getItem(KEY)
}

export function clearSignupToken(): void {
  window.sessionStorage.removeItem(KEY)
}
