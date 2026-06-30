import { GraphQLClient } from "graphql-request"

// 목↔실서버 전환 단일 지점. 기본: 목 ON.
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false"

const endpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT ?? ""

// USE_MOCK=false 일 때만 실제 호출. 지금은 스캐폴드.
export const gqlClient = new GraphQLClient(endpoint)

/** 목 응답을 비동기로 흉내(네트워크 지연 시뮬레이션) */
export function mockResponse<T>(data: T, delayMs = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delayMs))
}
