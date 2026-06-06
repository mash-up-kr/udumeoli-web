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
