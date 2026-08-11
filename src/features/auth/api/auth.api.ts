// 카카오 로그인 REST API (노션 스펙). 상대경로 — dev는 vite proxy, prod는 nitro가 백엔드로 프록시.

export class AuthApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = "AuthApiError"
  }
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  tokenType: string
  accessTokenExpiresIn: number
}

export interface ExchangeResponse {
  status: "AUTHENTICATED" | "SIGNUP_REQUIRED"
  tokens: AuthTokens | null
  signupToken: string | null
}

async function authPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    // 에러 공통 포맷 { code, message } — 파싱 실패(HTML 에러 페이지 등) 대비 폴백
    let code = "UNKNOWN"
    let message = ""
    try {
      const data = (await res.json()) as { code?: string; message?: string }
      code = data.code ?? code
      message = data.message ?? ""
    } catch {
      // 본문이 JSON이 아니면 상태 코드만으로 판단
    }
    throw new AuthApiError(res.status, code, message)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export function exchangeLoginCode(code: string): Promise<ExchangeResponse> {
  return authPost("/api/auth/exchange", { code })
}

export function requestSignupImageUpload(input: {
  signupToken: string
  contentType: string
}): Promise<{ imageId: number; uploadUrl: string }> {
  return authPost("/api/auth/signup/image-upload-url", input)
}

export async function uploadImage(
  uploadUrl: string,
  file: File
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  })
  if (!res.ok) throw new AuthApiError(res.status, "UPLOAD_FAILED", "")
}

export function completeSignup(input: {
  signupToken: string
  nickname: string
  profileImage: number
}): Promise<AuthTokens> {
  return authPost("/api/auth/signup", input)
}

export function logoutSession(refreshToken: string): Promise<void> {
  return authPost("/api/auth/logout", { refreshToken })
}
