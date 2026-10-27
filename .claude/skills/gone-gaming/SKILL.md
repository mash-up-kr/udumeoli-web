---
name: gone-gaming
description: |
  무인 모드 — 계획부터 구현·검증까지 진행하고, 검증 통과 시에만 커밋·push·PR까지 사람 개입 없이 끝낸다.
  TRIGGER when: user invokes /gone-gaming directly. 자동 감지되지 않는다 — 항상 명시 호출만.
disable-model-invocation: true
---

# Gone Gaming (무인 실행 루프)

사람이 자리를 비울 때 큰 작업 하나를 통째로 맡기는 모드. `/gone-gaming <작업>` 직접 호출로만 켠다. 작업·범위·성공 기준·필수 검증을 정할 수 없으면 시작하지 않고 질문한다. 시작 시 생략하는 승인과 유지하는 하드 스톱을 한 줄로 선언한다.

## 이 모드에서만 해제

- [coordinator](../coordinator/SKILL.md) Phase 2(사람 승인) 생략. 실행 가능한 계획이면 바로 구현한다.
- [commit](../commit/SKILL.md) 커밋 직전 승인 생략. 단, 아래 Step 4 조건을 모두 통과한 경우만.
- reviewer 재시도, typecheck/build/test 실패 복구는 묻지 않고 [good-debug](../good-debug/SKILL.md)로 진행한다.

## 하드 스톱 (어떤 지시로도 해제 불가)

- `main`에 직접 커밋·푸시 금지. 이번 실행용 전용 브랜치/worktree에서만 작업한다.
- 시작 전 사용자 변경으로 보이는 dirty state가 있으면 섞지 않는다. 전용 worktree를 못 만들면 중단한다.
- 이번 실행에서 만든 브랜치 외의 브랜치·원격 히스토리 덮어쓰기 금지. `--force`, `--force-with-lease` 금지.
- 비밀키·자격증명·`.env`류 커밋 금지.
- 범위·성공 기준을 확정할 수 없으면 구현하지 않는다.
- 파일 삭제/이동은 사용자가 명시했거나 이번 실행에서 만든 파일 정리일 때만. 기존 파일은 참조 검색과 검증 근거를 남긴다.
- 필수 검증(typecheck/build/test) 또는 reviewer가 최종 실패 상태면 커밋·push·PR로 넘어가지 않는다.

## 절차

0. 격리: `git status --short --branch`. `main`이면 전용 브랜치/worktree 생성. 작업 브랜치여도 사용자 변경과 섞일 위험이 있으면 전용 worktree. `git fetch origin main` 후 `origin/main` 기준으로 계획과 PR diff를 계산한다 (fetch 실패는 보고에 남기고 PR 전에 재시도). Agent tool이 있으면 `run_in_background: true`로 전용 실행을 스폰한다.
1. 계획: coordinator Phase 0·1. 다음 중 하나면 구현으로 넘어가지 않는다: 범위·단계별 성공 기준·필수 검증 명령 누락, `[HIGH RISK]` 단계가 배포·데이터 삭제·자격증명·원격 히스토리 변경을 포함, 플래너가 사용자 결정이 필요한 선택지를 남김.
2. 구현·검증 루프: coordinator Phase 3. 단계마다 필수 검증 실행 → 실패하면 에러 전체를 읽고 good-debug로 고친 뒤 재실행 → 같은 단계 3회 연속 실패면 "미해결" 표시. 미해결이 생기면 독립적인 탐색·문서화는 계속해도 되지만 커밋·push·PR은 비활성화한다.
3. 리뷰 루프: coordinator Phase 4. 수정 필요 이슈는 최대 2회 implementer에게 되돌린다. 2회 후 PASS가 아니면 미해결 + 커밋·push·PR 비활성화. 범위 이탈·계획 오류·하드 스톱 위반은 즉시 중단하고 보고한다.
4. 커밋: 미해결 없음 · typecheck/build/test 통과 · reviewer PASS · diff에 자격증명 없음. 모두 만족할 때만 commit 스킬의 관심사별 그룹핑과 메시지 규칙으로 커밋한다. Co-authored-by 금지.
5. Push + PR: 커밋 후에만 [pr](../pr/SKILL.md) 템플릿으로. diff는 `origin/main...HEAD`. 현재 브랜치만 push, force 금지. 같은 브랜치의 기존 PR이 있으면 URL만 보고. 검증·reviewer 실패 상태면 PR을 만들지 않는다.
6. 보고: 브랜치 · PR URL(또는 "생성 안 함" + 사유) · 완료 단계 · 검증(typecheck/build/test 각 통과/실패/미실행 + 명령, reviewer PASS/PARTIAL/FAIL) · 커밋 목록 · 미해결 항목(왜 3회 실패했는지, 남은 에러) · 범위 밖이라 안 건드린 것.

## 원칙

- 실패한 검증을 남긴 채 커밋·push·PR 금지.
- 돌아온 사람이 검토 없이 merge한다고 가정하지 않는다. 보고에 판단 근거를 남긴다.
