# AGENTS.md (Codex entrypoint)

Source of truth is `.claude/`. This file is a map. Do not restate rules here.

## Commands

- dev `pnpm dev` (3000) · storybook `pnpm storybook` (6006)
- verify `pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm build` · one test `pnpm vitest run <path>`

## Read before substantial work (in order)

1. `.claude/rules/behavior.md`
2. `.claude/rules/simplicity.md`
3. `.claude/rules/front.md` when editing `src/**/*.ts` or `src/**/*.tsx`
4. `.claude/rules/backend.md` for backend integration work

## Non-negotiable

- No `git commit` without the user approving that specific commit. `/gone-gaming` is the only exception.
- Any commit request → follow `.claude/skills/commit/SKILL.md`. Any PR request → `.claude/skills/pr/SKILL.md`. Natural-language skill triggers are unreliable; follow the file regardless.
- Change only what the request requires. Reuse `src/shared` code and design tokens before adding anything new.

## Skills, agents, hooks

- Skills: `.claude/skills/*/SKILL.md`. Codex discovers them through `.agents/skills`, a symlink to `.claude/skills`. On Windows the link checks out as a text file unless `git config core.symlinks true` is set before checkout (`git checkout -- .agents/skills` to repair).
- Codex agent wrappers: `.codex/agents/*.toml` point at `.claude/agents/*/AGENT.md`.
- Hooks: `.codex/hooks.json` mirrors `.claude/settings.json`. The Stop hook runs typecheck + eslint on changed ts/tsx; exit 2 means fix the reported errors and continue.

## Figma

- Given a Figma URL, use Figma MCP first, check existing components and tokens, and match the referenced frame on mobile layout.
