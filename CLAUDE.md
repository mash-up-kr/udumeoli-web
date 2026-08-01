<!-- intent-skills:start -->

## Skill Loading

Before substantial work:

- Skill check: run `pnpm dlx @tanstack/intent@latest list`, or use skills already listed in context.
- Skill guidance: if one local skill clearly matches the task, run `pnpm dlx @tanstack/intent@latest load <package>#<skill>` and follow the returned `SKILL.md`.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

## Shared Agent Guidance

Claude and Codex should use the same project rules in this repository.

- Claude source files live under `.claude/`.
- Codex loads `AGENTS.md`, which points back to these same `.claude` rules and skills.
- Before substantial work, follow `.claude/rules/behavior.md` and `.claude/rules/simplicity.md`.
- When editing `src/**/*.ts` or `src/**/*.tsx`, also follow `.claude/rules/front.md`.
- Task workflows live in `.claude/skills`; Codex sees the same files through `.agents/skills`.
- Codex-specific wrappers for hooks and subagents live in `.codex/`, but `.claude/*` remains the shared source of truth.
