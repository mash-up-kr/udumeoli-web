# 행동 원칙

LLM 코딩 실수를 줄이기 위한 행동 가이드라인.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Commit Only With Explicit Approval

**`git commit` never runs without the user confirming that specific commit first — no exceptions, including automated flows (e.g. coordinator).**

- Finish the change, show what would be committed (diff/summary + proposed message), then wait.
- This applies even mid-task, even when the user has been steadily approving prior steps — approval doesn't carry forward to the next commit.
- The `udumeoli-coordinator` PR phase must pause for commit approval before running `git commit`, even though branch creation and PR opening downstream can stay automatic once the commit is approved.

## 6. Always Use the Commit/PR Skill Procedures

**Skill auto-triggering on natural language ("커밋 하자", "PR 올려줘") is not reliable — don't depend on it. Follow the documented procedure regardless of whether the Skill tool itself fires.**

- Why: skills compete for relevance matching each turn; unlike this rules file, they aren't guaranteed to load. On 2026-07-19, casual commit/PR requests were handled ad hoc instead of via `.claude/skills/commit` and `.claude/skills/pr`, producing a PR that didn't match `.github/PULL_REQUEST_TEMPLATE.md`.
- Any request to commit → follow `.claude/skills/commit` (concern-grouped, per-group approval before `git commit`).
- Any request to open/create a PR → follow `.claude/skills/pr` (fill `.github/PULL_REQUEST_TEMPLATE.md` exactly: 작업 내용 / 추가 설명 / 연결 이슈).

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
