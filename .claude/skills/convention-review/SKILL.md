---
name: convention-review
description: |
  현재 diff가 udumeoli-web 프로젝트 전용 룰(FSD 경계, good-* 기준, simplicity 사다리)에 맞는지만 검토한다.
  TRIGGER when: user invokes /convention-review directly, or asks for a "컨벤션 리뷰"/"룰 위반" check on the current diff.
---

# Convention Review

현재 diff가 이 저장소 고유 컨벤션에 맞는지만 검토한다. 범용 버그·가독성·성능 리뷰는 `/code-review`가 다룬다 — 여기선 **이 프로젝트 룰 파일에 적힌 기준 위반만** 잡는다.

## 절차

### Step 1. 대상 diff 확보

- 기본: `git diff HEAD` (스테이징 여부 무관하게 작업 중인 변경)
- 브랜치 전체 리뷰 요청 시: `git diff main...HEAD`

### Step 2. 변경 파일별 적용 룰 선택

| 대상                                                 | 적용 룰                                                                                                                                       |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 항상                                                 | [simplicity.md](../../rules/simplicity.md) — 과설계, 재사용 안 하고 새로 만든 것, 사다리(YAGNI→재사용→stdlib→네이티브→기존 의존성→한 줄) 위반 |
| `src/**/*.ts(x)` 전부                                | [front.md](../../rules/front.md) — FSD 레이어 단방향 의존성, 슬라이스 간 cross-import 금지, `index.ts` Public API 우회                        |
| `.tsx`                                               | [good-code](../good-code/SKILL.md), [good-a11y](../good-a11y/SKILL.md), [good-responsive](../good-responsive/SKILL.md)                        |
| `.ts` (비-`.tsx`)                                    | [good-code](../good-code/SKILL.md)                                                                                                            |
| `vite.config`·`tsconfig`·의존성(`package.json`) 변경 | [good-bundling](../good-bundling/SKILL.md)                                                                                                    |
| 버그 수정으로 보이는 diff                            | [good-debug](../good-debug/SKILL.md) — 증상만 땜빵했는지, 공유 호출자를 다 확인했는지                                                         |

### Step 3. diff 라인 단위로 위반만 찾는다

- diff에 없는 기존 코드(범위 밖)의 기존 위반은 지적하되 "diff 밖"이라고 명시하고 강제하지 않는다
- 룰 파일에 명시 안 된 스타일 취향은 지적하지 않는다

## 출력 형식

```
path:line: <위반 룰 파일/스킬>: <문제>. <고칠 방법>.
```

위반이 하나도 없으면:

```
컨벤션 위반 없음 — 검토한 룰: <목록>
```

## 행동 원칙

- 범용 코드 품질·버그·효율성은 다루지 않는다 — `/code-review` 몫이다
- 근거 없는 지적 금지 — 어떤 룰 파일의 어떤 기준을 위반했는지 항상 명시한다
- 이미 있던 코드(diff 밖)의 위반을 이번 변경 탓으로 돌리지 않는다
