# AGENTS.md (Codex entrypoint)

Source of truth is `.claude/`. This file is a map. Do not restate rules here.

## Commands

- dev `pnpm dev` (3000) · storybook `pnpm storybook` (6006)
- verify `pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm build` · one test `pnpm vitest run <path>`
- UI screenshots/measure `pnpm ui:shot <route>` → `.ui-shots/` (contract in `.claude/rules/ui.md`; run `pnpm exec playwright install chromium` once)

## Read before substantial work (in order)

1. `.claude/rules/behavior.md`
2. `.claude/rules/simplicity.md`
3. `.claude/rules/front.md` when editing `src/**/*.ts` or `src/**/*.tsx`
4. `.claude/rules/backend.md` for backend integration work
5. `.claude/rules/ui.md` when editing `src/**/*.tsx` or `src/app/styles.css`
6. `.claude/rules/product-spec.md` when planning, implementing, reviewing, or discussing service behavior

Product specs start at `docs/product/README.md`; unresolved policies live in
`docs/product/OPEN_QUESTIONS.md`. For spec extraction or policy updates, read
`.claude/skills/product-spec/SKILL.md` directly. If `.agents/skills` is checked
out as a text pointer instead of a symlink, use `.claude/skills` directly.

## Non-negotiable

- No `git commit` without the user approving that specific commit. `/gone-gaming` is the only exception.
- Any commit request → follow `.claude/skills/commit/SKILL.md`. Any PR request → `.claude/skills/pr/SKILL.md`. Natural-language skill triggers are unreliable; follow the file regardless.
- Change only what the request requires. Reuse `src/shared` code and design tokens before adding anything new.

## Skills, agents, hooks

- Skills: `.claude/skills/*/SKILL.md`. Codex discovers them through `.agents/skills`, a symlink to `.claude/skills`. On Windows the link checks out as a text file unless `git config core.symlinks true` is set before checkout (`git checkout -- .agents/skills` to repair).
- Codex agent wrappers: `.codex/agents/*.toml` point at `.claude/agents/*/AGENT.md`.
- Hooks: `.codex/hooks.json` mirrors `.claude/settings.json`. The Stop hook runs typecheck + eslint on changed ts/tsx; exit 2 means fix the reported errors and continue.

## Search

- Prefer gitignore-aware search. With `find`/`grep -r`, exclude `node_modules`, `.output`, `storybook-static`, `.ui-shots`.
- Open `node_modules` only for a specific package API, by its direct path. Never scan it.
- If the same search repeats with the same result, stop and change approach or ask.

## Figma

- Given a Figma URL, use Figma MCP first, check existing components and tokens, and match the referenced frame on mobile layout.
