# AGENTS.md

## Shared Agent Guidance

This repository keeps Claude and Codex behavior aligned through shared source
files under `.claude/`.

- Claude entrypoint: `CLAUDE.md`
- Codex entrypoint: `AGENTS.md`
- Shared rules: `.claude/rules/*.md`
- Shared skills: `.claude/skills/*/SKILL.md`
- Codex skill bridge: `.agents/skills` symlinked to `.claude/skills`
- Codex hook/agent wrappers: `.codex/`

Before substantial work, read and follow:

1. `.claude/rules/behavior.md`
2. `.claude/rules/simplicity.md`
3. `.claude/rules/front.md` when editing `src/**/*.ts` or `src/**/*.tsx`

For task-specific workflows, prefer the repo skills exposed through
`.agents/skills`. They are the same source files Claude uses from
`.claude/skills`.

## Repository Rules

- Keep changes surgical and directly tied to the user request.
- Prefer existing code, common components, and design tokens before adding new
  abstractions.
- Follow FSD boundaries documented in `.claude/rules/front.md`.
- For UI work, apply `good-code`, `good-a11y`, and `good-responsive` guidance
  before finalizing.
- For bug fixes, identify the shared root cause before patching symptoms.
- Run verification appropriate to the change: `pnpm typecheck`, focused tests,
  `pnpm lint`, and `pnpm build` when routing/build/runtime behavior may be
  affected.
- Do not run `git commit` unless the user explicitly approves that specific
  commit.

## Commit And PR Requests

Natural-language skill auto-triggering can be unreliable. Any request to commit
or open a PR must follow the shared skill procedures:

- Commit requests: `.agents/skills/commit/SKILL.md`
- PR requests: `.agents/skills/pr/SKILL.md`

## Figma Work

When the user gives a Figma URL or asks for design implementation, use Figma MCP
first, inspect existing components/tokens, and keep mobile layout details
aligned with the referenced frame.
