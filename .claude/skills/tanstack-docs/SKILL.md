---
name: tanstack-docs
description: Use when unsure about a TanStack Start/Router API (server functions, server routes, loaders, search params, SSR, middleware). Loads official TanStack docs skills on demand via @tanstack/intent.
---

# TanStack Docs

공식 문서 스킬을 필요할 때만 로드한다. 매 작업 전에 실행하지 않는다 (네트워크, 60초 이상).

```bash
pnpm dlx @tanstack/intent@latest list                     # 전체 목록
pnpm dlx @tanstack/intent@latest load <package>#<skill>   # 하나 로드. 반환된 SKILL.md를 따른다
```

이 레포에서 쓰는 ID:

- `@tanstack/react-start#react-start` · `#react-start/server-components`
- `@tanstack/start-client-core#start-core` · `/server-functions` · `/server-routes` · `/middleware` · `/execution-model` · `/auth-server-primitives` · `/deployment`
- `@tanstack/router-core#router-core` · `/navigation` · `/data-loading` · `/search-params` · `/path-params` · `/auth-and-guards` · `/not-found-and-errors` · `/code-splitting` · `/ssr` · `/type-safety`
- `@tanstack/start-server-core#start-server-core` (createStartHandler, 쿠키·세션)
