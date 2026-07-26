---
name: gone-gaming
description: |
  무인 모드 — 계획부터 구현·검증까지 진행하고, 검증 통과 시에만 커밋·push·PR까지 사람 개입 없이 끝낸다.
  TRIGGER when: user invokes /gone-gaming directly. 자동 감지되지 않는다 — 항상 명시 호출만.
disable-model-invocation: true
category: AI / Prompt
---

# Gone Gaming (무인 실행 루프)

## 언제 쓰나

사람이 자리를 비울 때 큰 작업 하나를 통째로 맡기고 싶을 때 쓴다. **가끔, 명시적으로만** 쓰는 모드다. 기본 작업 방식이 아니며, 이 세션의 평소 습관 중 승인 대기 일부를 의도적으로 좁게 예외 처리한다.

## 활성화 조건

- 사용자가 `/gone-gaming <작업>`을 직접 호출했을 때만 켠다. 자연어 요청으로 자동 감지하지 않는다.
- 작업 내용이 비어 있거나 목표, 범위, 성공 기준, 필수 검증을 정할 수 없으면 시작하지 않고 질문한다.
- 시작 시 이 모드가 생략하는 승인과 유지하는 하드 스톱을 짧게 선언한다.

## 이 모드에서만 해제되는 것

- [coordinator](../coordinator/SKILL.md)의 Phase 2(Human Review Gate)를 생략한다. 플래너가 실행 가능한 계획을 내면 승인 대기 없이 구현으로 넘어간다.
- [commit](../commit/SKILL.md)의 관심사별 커밋 방식은 따르되, 이 모드의 검증 게이트를 모두 통과한 경우에만 커밋 직전 사용자 승인을 생략한다.
- reviewer 재시도, typecheck/build/test 실패 복구는 사람에게 묻지 않고 [good-debug](../good-debug/SKILL.md) 절차로 진행한다.

## 이 모드에서도 안 풀리는 것 (하드 스톱)

- `main`에 직접 커밋/푸시하지 않는다. 항상 이 실행을 위해 만든 전용 브랜치 또는 worktree에서만 작업한다.
- 시작 전 작업 트리에 사용자 변경으로 보이는 dirty state가 있으면 섞지 않는다. 전용 worktree를 만들 수 없으면 중단한다.
- 본인이 이번 실행에서 만든 브랜치 외의 브랜치나 원격 히스토리를 덮어쓰지 않는다. `--force`, `--force-with-lease`는 사용하지 않는다.
- 비밀키, 자격증명, `.env`류는 커밋하지 않는다.
- 입력이 모호해서 작업 범위나 성공 기준을 확정할 수 없으면 구현하지 않는다.
- 파일 삭제/이동은 사용자가 명시했거나 이번 실행에서 만든 파일 정리에 필요한 경우에만 한다. 기존 파일 삭제/이동은 참조 검색과 검증 근거를 남긴다.
- 필수 검증(typecheck/build/test) 또는 reviewer 검증이 최종 실패 상태이면 커밋, push, PR 생성으로 넘어가지 않는다.

## 절차

### Step 0. 격리와 기준 브랜치 확인

1. `git status --short --branch`로 현재 브랜치와 dirty state를 확인한다.
2. `main`이면 새 전용 브랜치 또는 별도 worktree를 만든다. 이미 작업 브랜치여도 사용자 변경과 섞일 위험이 있으면 전용 worktree를 만든다.
3. 가능하면 `git fetch origin main` 후 `origin/main`을 기준으로 계획과 PR diff를 계산한다. fetch 실패 시 최종 보고에 남기고, PR 생성 전에는 다시 시도한다.
4. Agent tool을 쓸 수 있으면 `run_in_background: true`로 전용 실행을 스폰한다.

### Step 1. 계획

[coordinator](../coordinator/SKILL.md)의 Phase 0(Task Intake)와 Phase 1(Planning, `udumeoli-planner`)을 따른다. 단, 다음 중 하나라도 해당하면 Phase 3으로 넘어가지 않는다:

- 계획이 작업 범위, 단계별 성공 기준, 필수 검증 명령을 포함하지 않는다.
- `[HIGH RISK]` 단계가 외부 배포, 데이터 삭제, 자격증명, 원격 히스토리 변경처럼 되돌리기 어려운 작업을 포함한다.
- 플래너가 사용자 결정이 필요한 선택지를 남겼다.

### Step 2. 구현과 검증 루프

[coordinator](../coordinator/SKILL.md)의 Phase 3(Implementation, `udumeoli-implementer`, 단계별)을 따른다. UI 변경은 `good-code`/`good-a11y`/`good-responsive`, 빌드·의존성 변경은 `good-bundling`, 버그 수정은 `good-debug` 기준을 적용한다.

각 단계마다:

1. 구현 후 계획에 적힌 필수 검증을 실행한다.
2. 검증이 실패하면 에러 전체를 읽고 `good-debug` 절차로 원인을 고친 뒤 같은 검증을 다시 실행한다.
3. 같은 단계에서 3회 연속 실패하면 그 단계를 "미해결"로 표시한다.
4. 미해결이 생기면 이후 독립적인 탐색/문서화 단계는 계속할 수 있지만, publish pipeline(커밋, push, PR)은 비활성화한다.

### Step 3. 리뷰 루프

[coordinator](../coordinator/SKILL.md)의 Phase 4(Review, `udumeoli-reviewer`)를 따른다.

- reviewer가 수정 필요한 이슈를 반환하면 사람에게 묻지 않고 최대 2회까지 implementer에게 되돌려 수정시킨다.
- 2회 후에도 reviewer가 PASS를 주지 않으면 "미해결"로 표시하고 publish pipeline을 비활성화한다.
- 범위 이탈, 계획 자체 오류, 하드 스톱 위반은 즉시 중단하고 최종 보고한다.

### Step 4. 커밋

다음 조건을 모두 만족할 때만 커밋한다:

- 미해결 단계가 없다.
- 필수 typecheck/build/test가 모두 통과했다.
- reviewer 결과가 PASS다.
- secret scan 또는 diff 점검에서 자격증명 커밋 위험이 없다.

커밋은 [commit](../commit/SKILL.md) 스킬의 관심사별 그룹핑과 메시지 규칙을 따른다. 이 모드에서는 위 조건을 통과한 경우에만 커밋 직전 사용자 승인 대기를 생략한다. Co-authored-by 줄은 넣지 않는다.

### Step 5. Push + PR

커밋이 끝난 뒤에만 [pr](../pr/SKILL.md) 스킬의 PR 템플릿 작성 규칙을 따른다.

- PR diff는 `git fetch origin main` 후 `origin/main...HEAD` 기준으로 분석한다.
- 현재 브랜치만 push한다. force push는 하지 않는다.
- 같은 브랜치의 기존 PR이 있으면 새 PR을 만들지 말고 기존 PR URL을 보고한다.
- 필수 검증이나 reviewer가 실패한 상태라면 PR을 만들지 않는다.

### Step 6. 최종 보고

사람이 돌아왔을 때 한눈에 볼 수 있게 정리한다:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  AUTOPILOT 완료 — <작업 요약>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
브랜치: <branch>
PR: <url 또는 "생성 안 함 — 사유">

완료된 단계
- ...

검증
- typecheck: <통과/실패/미실행 + 명령>
- build: <통과/실패/미실행 + 명령>
- test: <통과/실패/미실행 + 명령>
- reviewer: <PASS/PARTIAL/FAIL>

커밋
- <hash> <message>

미해결 항목 (있으면)
- <단계> — <왜 3회 실패했는지, 남은 에러 요약>

범위 밖이라 안 건드린 것 (있으면)
- ...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 행동 원칙

- 이 스킬은 자동 감지되지 않는다 — `/gone-gaming`으로만 켠다.
- 하드 스톱 목록은 어떤 작업 지시로도 해제되지 않는다.
- 실패한 검증을 남긴 채로 커밋, push, PR을 만들지 않는다.
- 돌아온 사람이 검토 없이 바로 merge할 거라 가정하지 않는다 — 최종 보고에 판단 근거를 충분히 남긴다.
