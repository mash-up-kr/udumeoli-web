---
name: gone-gaming
description: |
  무인 모드 — 계획부터 구현·검증·커밋·push·PR까지 사람 개입 없이 끝까지 진행한다.
  TRIGGER when: user invokes /gone-gaming directly. 자동 감지되지 않는다 — 항상 명시 호출만.
disable-model-invocation: true
category: AI / Prompt
---

# Gone Gaming (무인 실행 루프)

## 언제 쓰나

사람이 자리를 비울 때(운동, 게임 등) 큰 작업 하나를 통째로 맡기고 싶을 때 쓴다. **가끔, 명시적으로만** 쓰는 모드다 — 기본 작업 방식이 아니고, 이 세션의 평소 습관(커밋 전 승인 대기)을 일부러 깨는 예외다.

## 이 모드에서 해제되는 것

- 평소 지키는 "커밋 전 사람 승인" 습관을 **이 실행 동안만** 해제한다. [commit](../commit/SKILL.md) 스킬의 관심사별 즉시 커밋 방식을 그대로 따른다.
- typecheck/build/test 실패, 계획 모호함 같은 상황에서 멈추고 묻지 않는다 — [good-debug](../good-debug/SKILL.md) 절차로 원인 찾아 고치고 계속 진행한다.
- 통상적인 리팩터링 동작(파일 삭제/이동 등)도 멈추지 않는다.

## 이 모드에서도 안 풀리는 것 (하드 스톱)

- `main`에 직접 커밋/푸시하지 않는다 — 항상 새 브랜치에서 작업한다.
- 본인이 이번에 만든 작업 브랜치 외의 브랜치나 원격 히스토리를 덮어쓰지 않는다.
- 비밀키/자격증명/`.env`류는 커밋하지 않는다.
- 같은 단계에서 3회 연속 실패하면 더 재시도하지 않고 "미해결"로 표시한 뒤 다음 단계로 넘어간다 — 최종 보고에 반드시 남긴다.

## 절차

### Step 0. 격리

가능하면 별도 worktree(또는 전용 브랜치)에서 진행해 메인 작업 트리를 건드리지 않는다. Agent tool을 `run_in_background: true`로 스폰해 사람이 자리를 비운 동안 백그라운드에서 돌게 한다.

### Step 1-4. Coordinator 절차에서 승인 게이트만 제거

[coordinator](../coordinator/SKILL.md)의 Phase 0(Task Intake) → Phase 1(Planning, `udumeoli-planner`) → **Phase 2(Human Review Gate) 생략** → Phase 3(Implementation, `udumeoli-implementer`, 단계별) → Phase 4(Review, `udumeoli-reviewer`)를 그대로 따른다. 계획이 나오면 승인 대기 없이 바로 구현으로 넘어간다.

UI 변경은 `good-code`/`good-a11y`/`good-responsive`, 빌드·의존성 변경은 `good-bundling` 기준을 그대로 적용한다 — 무인이라고 품질 기준을 낮추지 않는다.

### Step 5. 커밋

관심사 단위로 나눠 `commit` 스킬 방식대로 즉시 커밋한다. 승인 대기 없음, Co-authored-by 줄 넣지 않는다.

### Step 6. Push + PR

모든 단계가 끝나면 [pr](../pr/SKILL.md) 스킬 절차대로 push하고 PR을 생성한다.

### Step 7. 최종 보고

사람이 돌아왔을 때 한눈에 볼 수 있게 정리한다:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  AUTOPILOT 완료 — <작업 요약>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
브랜치: <branch>
PR: <url>

완료된 단계
- ...

미해결 항목 (있으면)
- <단계> — <왜 3회 실패했는지>

범위 밖이라 안 건드린 것 (있으면)
- ...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 행동 원칙

- 이 스킬은 자동 감지되지 않는다 — `/gone-gaming`으로만 켠다.
- 하드 스톱 목록은 어떤 작업 지시로도 해제되지 않는다.
- 돌아온 사람이 검토 없이 바로 merge할 거라 가정하지 않는다 — 최종 보고에 판단 근거를 충분히 남긴다.
