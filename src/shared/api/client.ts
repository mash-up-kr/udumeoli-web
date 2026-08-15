import { ClientError, GraphQLClient } from "graphql-request"

import { authFetch } from "./auth-fetch"
import { getAccessToken } from "./token-storage"

// 목↔실서버 전환 단일 지점. 기본: dev 서버(localhost)는 목 ON, 프로덕션 빌드는 실서버.
// VITE_USE_MOCK="true"/"false"로 강제할 수 있고,
// dev에선 좌하단 MockToggle 버튼(localStorage 오버라이드)이 env 설정보다 우선한다.
const MOCK_FLAG_KEY = "udumeoli:mock"

function readMockOverride(): boolean | null {
  if (!import.meta.env.DEV || typeof window === "undefined") return null
  const value = window.localStorage.getItem(MOCK_FLAG_KEY)
  if (value === "on") return true
  if (value === "off") return false
  return null
}

export const USE_MOCK = (() => {
  const override = readMockOverride()
  if (override !== null) return override
  const flag = import.meta.env.VITE_USE_MOCK
  // 배포본에 목데이터(여행 100번 등)가 섞이지 않도록 env 미설정 시 프로덕션은 실서버
  return flag ? flag === "true" : import.meta.env.DEV
})()

/** dev 전용 — 목 플래그 토글 후 새로고침 (캐시·store 잔재까지 리셋). */
export function toggleMockMode() {
  window.localStorage.setItem(MOCK_FLAG_KEY, USE_MOCK ? "off" : "on")
  window.location.reload()
}

// graphql-request는 절대 URL만 받는다 — 상대경로(/graphql, vite proxy 경유)면
// 브라우저 origin을 붙여준다. SSR에선 window가 없지만 쿼리는 클라에서만 실행된다.
const rawEndpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT || "/graphql"
const endpoint =
  rawEndpoint.startsWith("/") && typeof window !== "undefined"
    ? window.location.origin + rawEndpoint
    : rawEndpoint
/** 백엔드 origin — OAuth 시작처럼 브라우저를 직접 이동시킬 때만 사용. API 호출은 프록시 경유 상대경로. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""

// 인증: Authorization Bearer. 만료(401) 시 authFetch가 refresh 후 1회 재시도한다.
export const gqlClient = new GraphQLClient(endpoint, {
  credentials: "include",
  fetch: authFetch,
  headers: (): Record<string, string> => {
    const token = getAccessToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  },
})

/** 목 응답을 비동기로 흉내(네트워크 지연 시뮬레이션) */
export function mockResponse<T>(data: T, delayMs = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delayMs))
}

/** 엔티티 쿼리 훅이 호출부에 열어두는 옵션 — 전체 UseQueryOptions를 노출하지 않는다. */
export interface QueryOptions {
  enabled?: boolean
  refetchOnMount?: boolean | "always"
  retry?: boolean | number
}

/** 서버가 내려주는 유저 형태 — user·travel-pot 등 여러 엔티티가 같은 모양으로 받는다. */
export interface UserDto {
  id: string
  nickname: string
  profileImage: number
  /** 업로드 이미지면 URL, 프리셋(1~4)이면 null. */
  profileImageUrl: string | null
}

/** GraphQL 에러 응답의 extensions.code — 네트워크 오류 등 그 외 에러는 undefined. */
export function getGraphQLErrorCode(error: unknown): string | undefined {
  if (!(error instanceof ClientError)) return undefined
  const extensions = error.response.errors?.[0]?.extensions as
    | { code?: string }
    | undefined
  return extensions?.code
}
