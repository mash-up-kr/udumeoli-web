---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

## 아키텍처: FSD

레이어 `app > pages > widgets > features > entities > shared`. `src/` 아래 전부 존재한다.

- `app/`: 라우팅·글로벌 스타일·진입 설정. 파일 라우트는 `app/routes/`
- `pages/`: 화면 단위 UI (라우트 컴포넌트가 아니라 실제 화면)
- `widgets/`: 독립 UI 블록 · `features/`: 사용자 시나리오 · `entities/`: 도메인 모델
- `shared/`: 도메인 무관 공통. shadcn/ui는 `shared/ui/`, 유틸은 `shared/lib/`, API 클라이언트는 `shared/api/`

의존 규칙은 `eslint.config.js`의 `eslint-plugin-boundaries`가 기계 검사한다: 상위→하위 단방향, 같은 레이어의 다른 슬라이스 import 금지. 슬라이스 외부 노출은 `index.ts`(Public API)로만 한다 (이 항목만 린트 미적용, 수동 준수).

## GraphQL 엔티티 연결

새 엔티티는 `entities/user` · `entities/travel-pot`를 그대로 베낀다. 파일 2개가 전부다.

- `entities/<x>/api/<x>.api.ts`: 쿼리 문서 + DTO + 도메인 변환 함수. 목 분기 `if (USE_MOCK) return mockResponse(MOCK_X)`는 항상 함수 첫 줄.
- `entities/<x>/api/queries.ts`: 쿼리 키 + 훅. 옵션 타입은 `shared/api/client`의 `QueryOptions`. 전체 `UseQueryOptions` 노출 금지, 필요한 필드만 추가.

규칙:

- `USE_MOCK`은 테스트 전용. dev·prod는 항상 실서버(프록시 경유). vitest만 `vite.config.ts`의 `test.env`(`VITE_USE_MOCK=true`)로 목을 탄다.
- entities 간 cross-import 불가. 공유 조각(`UserDto`, `QueryOptions`)은 `shared/api/client.ts`에만. 프리셋 번호→에셋 매핑은 `shared/ui/profile`의 `presetAvatarSrc`.
- 서버 데이터 + zustand store 동시 사용(`travel-pot` 참고): 동기화 훅 하나가 서버 응답을 store에 덮고 화면은 store만 읽는다(`useMyPots`). 화면에서 목/서버 분기 금지. 응답 전·실패 시 persist된 store 값이 폴백이므로 화면마다 폴백 로직을 쓰지 않는다. 뮤테이션은 `onSuccess`에서 쿼리 캐시와 store를 함께 갱신하고, 호출부에서 캐시를 직접 만지지 않는다.

## Gotchas

- Storybook 환경은 TanStack 플러그인이 빠진다. 라우팅 의존 컴포넌트는 props로 추상화한다. 스토리는 컴포넌트와 같은 폴더의 `*.stories.tsx`.
- `shared/ui` 컴포넌트를 추가·수정하면 스토리도 함께 추가·수정한다.
