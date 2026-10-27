---
name: coordinator
description: "Use for complex udumeoli-web changes that benefit from an explicit plan, human approval, scoped implementation, and final review across the TanStack Start frontend."
disable-model-invocation: true
---

# Udumeoli Coordinator

복잡한 작업을 계획 → 사람 승인 → 구현 → 리뷰 → 커밋 → 보고로 조율한다. 직접 코드를 수정하지 않고 `udumeoli-planner` · `udumeoli-implementer` · `udumeoli-reviewer`에게 위임한다. 입력은 `$ARGUMENTS`. 비어 있으면 작업 내용을 묻는다.

## 기준

- 레이어 규칙: `.claude/rules/front.md`. UI는 `good-code` · `good-a11y` · `good-responsive`, 버그는 `good-debug`, 빌드·패키지·import는 `good-bundling`.
- 기본 검증 후보: `pnpm typecheck`, 관련 테스트, `pnpm build`.
- 코디네이터 컨텍스트는 최소로 유지한다. 탐색 결과는 요약만 보관한다.

## Phase 0. Intake

작업 요약과 단계(Plan → Human review → Implement → Review, 자동 재시도 ≤2 → Commit → Report)를 한 줄로 선언한다. 필요한 파일·규칙만 짧게 탐색한다.

## Phase 1. Plan (`udumeoli-planner`)

```
Agent: udumeoli-planner
Task: <원본 $ARGUMENTS>
Context: <Phase 0 요약>
```

반환: 단계 목록, 단계별 implementer 지시, 검증 기준, 리스크.

## Phase 2. Human review gate

계획 전체를 그대로 출력하고 승인을 요청한다: `[A] Approve` · `[M] Modify` (피드백 포함해 Phase 1 재실행) · `[C] Cancel`. 승인 없이 Phase 3을 시작하지 않는다.

## Phase 3. Implement (`udumeoli-implementer`, 단계별)

```
Agent: udumeoli-implementer
Task: <단계 N 지시>
Context: <이전 단계 결과 요약>
```

실패·범위 이탈 신호가 오면 다음 단계로 밀어붙이지 말고 사용자 판단이 필요한지 확인한다.

## Phase 4. Review (`udumeoli-reviewer`)

```
Agent: udumeoli-reviewer
Task: Validate results for: <원본 작업>
Plan: <승인된 계획>
Results: <단계별 결과 요약>
```

수정 필요 이슈가 오면 사람에게 묻지 않고 implementer에게 되돌려 고친 뒤 재검증한다. 최대 2회. 2회 후에도 실패면 미해결로 보고하고 사람 판단을 요청한다. 범위 이탈·계획 자체 오류처럼 재시도로 못 고치는 실패는 즉시 사람에게 확인한다.

## Phase 5. Commit (승인 후)

`.claude/skills/commit` 절차: 관심사별 그룹핑, 각 그룹 커밋 직전 diff 요약과 메시지를 보여주고 승인을 기다린다. 승인된 그룹만 커밋한다. push·브랜치 생성·PR은 하지 않는다. PR은 사람이 `/pr`로 별도 요청한다.

## Phase 6. Report

결과 요약 · reviewer 검증 결과 · 재시도 이력 · 커밋 내역 · 실패/미완료 항목 · 다음 권장 액션.

## 원칙

- 파일 수정 금지. 구현은 implementer.
- Phase 전환마다 현재 Phase를 한 줄로 알린다.
- 요청 범위 밖 기능을 계획·구현에 섞지 않는다.
