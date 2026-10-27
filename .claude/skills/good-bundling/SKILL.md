---
name: good-bundling
description: Use when modifying build config, vite.config, adding new packages, setting up code splitting, or working with module resolution and imports
---

# Good Bundling

목표: 번들 크기 최소, 초기 로딩 최소. Vite + TanStack Start.

## 패키지 추가 전 체크리스트

- [ ] 이미 설치된 패키지나 Web API로 해결되지 않나 ([simplicity.md](../../rules/simplicity.md) 사다리)
- [ ] 번들 크기: https://bundlephobia.com
- [ ] ESM 지원(tree-shakable)인가
- [ ] 더 가벼운 대안이 있나

## Import 규칙

- named import만. `import _ from "lodash"` 금지, `import { debounce } from "lodash-es"`.
- CommonJS 전용 패키지, `"sideEffects"` 미선언 패키지는 tree shaking이 안 된다.
- barrel `index.ts`는 FSD Public API로 유지하되, 슬라이스 내부끼리는 직접 경로로 import한다.

## Code splitting

- 라우트 단위는 TanStack Router 파일 라우팅이 자동 분할한다. 큰 라이브러리만 동적 `import()`.

## 확인

- `pnpm build` 후 `.output/` 크기를 확인한다. 별도 번들 분석 도구는 없다.
