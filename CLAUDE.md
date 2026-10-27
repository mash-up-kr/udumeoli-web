# udumeoli-web

TanStack Start(SSR) · React 19 · TS strict · Tailwind 4 · shadcn/ui · pnpm. FSD 레이어: `src/app · pages · widgets · features · entities · shared`.

## Commands

- dev: `pnpm dev` (3000) · storybook: `pnpm storybook` (6006)
- verify: `pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm build`
- 단일 테스트: `pnpm vitest run <path>`
- UI 확인: `pnpm ui:shot <route> [--measure "<sel>"]` → `.ui-shots/` (규칙·뷰포트는 `.claude/rules/ui.md`). 첫 사용 전 1회 `pnpm exec playwright install chromium`

## Rules (`.claude/rules`, 자동 로드)

- `behavior.md` · `simplicity.md`: 항상 · `front.md`: `src/**/*.ts(x)` 작업 시 · `ui.md`: `src/**/*.tsx`·`styles.css` 작업 시 · `backend.md`: BE 연동 작업

## Skills (`.claude/skills`)

- 커밋·PR 요청은 자연어여도 반드시 `/commit` · `/pr` 절차를 따른다 (자동 트리거 불신).
- TanStack Start/Router API가 불확실하면 `/tanstack-docs`.

## Search

- 파일·내용 검색은 Grep·Glob 도구(gitignore 준수)를 쓴다. Bash `find`/`grep -r`를 쓰면 `node_modules`, `.output`, `storybook-static`, `.ui-shots`를 제외한다.
- `node_modules` 안은 특정 패키지의 API·타입을 확인할 때만 그 패키지 경로를 직접 연다. 전체 탐색 금지.
- 같은 검색을 두 번 해서 같은 결과면 멈추고 접근을 바꾸거나 사용자에게 묻는다.

## Gotchas

- Stop 훅이 변경된 ts/tsx에 typecheck + eslint를 돌린다. 실패하면 턴이 끝나지 않는다. 에러를 고치거나, 내 변경과 무관한 기존 에러면 그 사실을 보고한다.
- 커밋 시 lint-staged가 `eslint --fix` + prettier로 재포맷한다. 커밋 후 diff를 다시 확인한다.
- nitro dev의 `ssr is unavailable` · `getBuiltins` 타임아웃은 dev 서버 재시작으로 해결된다. 코드·env 문제가 아니다.
- `AGENTS.md`는 Codex용 미러다. 원본은 `.claude/`.
