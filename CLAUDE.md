# udumeoli-web

TanStack Start(SSR) · React 19 · TS strict · Tailwind 4 · shadcn/ui · pnpm. FSD 레이어: `src/app · pages · widgets · features · entities · shared`.

## Commands

- dev: `pnpm dev` (3000) · storybook: `pnpm storybook` (6006)
- verify: `pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm build`
- 단일 테스트: `pnpm vitest run <path>`

## Rules (`.claude/rules`, 자동 로드)

- `behavior.md` · `simplicity.md`: 항상 · `front.md`: `src/**/*.ts(x)` 작업 시 · `backend.md`: BE 연동 작업

## Skills (`.claude/skills`)

- 커밋·PR 요청은 자연어여도 반드시 `/commit` · `/pr` 절차를 따른다 (자동 트리거 불신).
- TanStack Start/Router API가 불확실하면 `/tanstack-docs`.

## Gotchas

- Stop 훅이 변경된 ts/tsx에 typecheck + eslint를 돌린다. 실패하면 턴이 끝나지 않는다. 에러를 고치거나, 내 변경과 무관한 기존 에러면 그 사실을 보고한다.
- 커밋 시 lint-staged가 `eslint --fix` + prettier로 재포맷한다. 커밋 후 diff를 다시 확인한다.
- nitro dev의 `ssr is unavailable` · `getBuiltins` 타임아웃은 dev 서버 재시작으로 해결된다. 코드·env 문제가 아니다.
- `AGENTS.md`는 Codex용 미러다. 원본은 `.claude/`.
