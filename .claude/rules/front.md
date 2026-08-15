---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

## 아키텍처

FSD(Feature-Sliced Design) 구조를 따른다.

**현재 구성된 레이어 (app / pages / shared)**

- `app/` — 라우팅, 글로벌 스타일, 앱 진입 설정. TanStack 파일 기반 라우팅은 `app/routes/` 안에 위치
- `pages/` — 페이지 단위 UI 컴포넌트. 라우트 컴포넌트가 아니라 실제 화면 UI
- `shared/` — 도메인 무관 공통 코드 (shadcn/ui 컴포넌트는 `shared/ui/`, 유틸은 `shared/lib/`)

**기능이 생기면 하위 레이어를 추가한다 (필요할 때만, 미리 생성 금지)**

- `entities/` — 도메인 엔티티 (User, Post 등)
- `features/` — 사용자 시나리오 단위 기능
- `widgets/` — 독립적인 UI 블록

**규칙**

- 레이어 단방향 의존성: 상위 레이어는 하위 레이어만 참조 가능
- 슬라이스 간 직접 import 금지 (같은 레이어 내 cross-import 금지)
- 각 슬라이스는 `index.ts` (Public API)를 통해서만 외부에 노출

## GraphQL 엔티티 연결

목↔실서버 전환은 `shared/api/client.ts`의 `USE_MOCK` 한 곳에서만 갈린다 (기본: dev 서버는 목, 프로덕션 빌드는 실서버. `VITE_USE_MOCK=true|false`로 강제).
새 엔티티를 붙일 때는 이미 연결된 `entities/user`·`entities/travel-pot`를 그대로 베낀다.

**파일 2개가 전부다.**

`entities/<x>/api/<x>.api.ts` — 쿼리 문서 + DTO + 도메인 변환:

```ts
const FOO_QUERY = /* GraphQL */ `query Foo { foo { id name } }`

interface FooResponse { foo: FooDto }

function toFoo(dto: FooDto): Foo { ... }

export async function fetchFoo(): Promise<Foo> {
  if (USE_MOCK) return mockResponse(MOCK_FOO)   // 목 분기는 항상 함수 첫 줄
  const data = await gqlClient.request<FooResponse>(FOO_QUERY)
  return toFoo(data.foo)
}
```

`entities/<x>/api/queries.ts` — 쿼리 키 + 훅. 옵션 타입은 `shared/api/client`의 `QueryOptions`를 쓴다
(전체 `UseQueryOptions`를 노출하지 말고, 새 옵션이 실제로 필요해질 때 거기에 필드를 더한다).

**공유 조각은 `shared/api/client.ts`에 있다** — entities끼리는 cross-import가 막혀 있어서 여기가 유일한 공용 지점이다.

- `UserDto` — 서버가 여러 쿼리에서 같은 모양으로 내려주는 유저 (`{ id, nickname, profileImage: number }`). 프리셋 번호→에셋 매핑은 `shared/ui/profile`의 `presetAvatarSrc`가 담당한다
- `QueryOptions` — 엔티티 훅이 호출부에 열어주는 옵션

**서버 데이터와 zustand store를 함께 쓰는 경우** (`travel-pot` 참고):

- 화면에서 "목이냐 서버냐"를 분기하지 말 것. 동기화 훅 하나가 서버 응답을 store에 덮고, 화면은 store만 읽는다 (`useMyPots`).
- 응답 전·실패 시엔 persist된 store 값이 자동으로 폴백이 된다 — 화면마다 폴백 로직을 다시 쓰지 않는다.
- 생성·참여 같은 뮤테이션은 `onSuccess`에서 쿼리 캐시와 store를 함께 갱신한다. 호출부에서 캐시를 직접 만지지 않는다.

**테스트**는 `vite.config.ts`의 `test.env`가 `VITE_USE_MOCK=true`로 고정한다 — 로컬 `.env`에 결과가 흔들리지 않는다.

## 기술 스택

- **프레임워크**: TanStack Start (SSR), React 19
- **언어**: TypeScript (strict)
- **라우팅**: TanStack Router (파일 기반, `app/routes/`)
- **서버 상태 / 캐싱**: TanStack Query
- **클라이언트 상태**: Zustand
- **API**: graphql-request + GraphQL
- **스타일링**: Tailwind CSS 4 + shadcn/ui (radix-ui 기반)
- **아이콘**: lucide-react
- **컴포넌트 개발**: Storybook (`@storybook/react-vite`)
  - stories는 컴포넌트와 같은 폴더에 위치 (`*.stories.tsx`)
  - Storybook 환경에서 TanStack 플러그인 제외됨 — 라우팅 의존 컴포넌트는 props로 추상화
