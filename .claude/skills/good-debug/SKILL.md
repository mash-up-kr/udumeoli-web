---
name: good-debug
description: Use when encountering a bug, unexpected behavior, or error in the frontend - before attempting any fix
---

# Good Debug

증상이 아닌 원인을 고친다. 에러를 숨기거나 우회하지 않는다.

## 절차

1. 진단: 에러 메시지를 첫 줄만 보지 말고 전체를 읽는다. 의미 → 상황 → 가능한 원인 순으로 생각한 뒤에 검색한다.
   - `TypeError`: undefined 접근, `await` 누락 · `ReferenceError`: 선언 위치, 스코프 · 네트워크: CORS, 인증, 4xx/5xx 구분 · 모듈: ESM/CJS, 경로, 확장자
2. 재현: 조건을 최소화한다. 무관한 비동기·상태·UI를 빼고 핵심 함수만 남긴다. 특정 데이터에서만 나면 그 조건을 고정한다.
3. 수정: 근본 원인. 건드릴 함수의 호출자를 전부 grep해 공유 지점 한 곳에서 고친다 ([simplicity.md](../../rules/simplicity.md)). 비즈니스 로직은 순수 함수로 분리해 테스트로 재발을 막는다.
4. 재발 방지: 같은 조건에서 다시 재현 시도. 엣지 케이스(빈 배열, null, 최대값) 확인. 같은 패턴의 버그가 다른 곳에 없는지 탐색.

## 금지

- `// @ts-ignore`, `as X`, `!`로 타입 에러 회피
- 빈 `catch {}`
- 원인 모르고 `key`를 바꿔 리렌더 강제
- `setTimeout`으로 타이밍 문제 땜질. 레이스는 `AbortController`로 이전 요청을 취소한다.

## 도구

| 상황             | 도구                                   |
| ---------------- | -------------------------------------- |
| 컴포넌트 상태    | React DevTools                         |
| 서버 상태 / 캐시 | React Query Devtools                   |
| 라우팅           | TanStack Router Devtools               |
| 네트워크         | 브라우저 Network 탭                    |
| 타입 에러        | `pnpm typecheck`                       |
| 빌드 에러        | `pnpm build`                           |
| 테스트           | `pnpm test` · `pnpm vitest run <path>` |
