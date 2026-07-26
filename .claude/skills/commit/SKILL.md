---
name: commit
description: |
  Analyzes staged/unstaged changes and performs atomic commits separated by concern.
  TRIGGER when: user invokes /commit directly, or says '커밋해줘', '커밋', 'commit'.
---

# Atomic Commit

현재 staged/unstaged 변경사항을 분석하여 관심사별로 분리된 atomic commit을 수행합니다.

## 작업 절차

1. `git status`와 `git diff HEAD`로 전체 변경사항을 파악한다.
2. 변경사항을 **관심사(concern)** 기준으로 논리적 그룹으로 분류한다.
   - 예: 모델/타입 변경, 비즈니스 로직, UI 컴포넌트, 스타일, 테스트, 설정 등
   - 서로 의존하는 변경이라도 관심사가 다르면 별도 커밋으로 분리한다.
3. 그룹별로 관련 파일만 staging한다.
4. **각 그룹을 커밋하기 직전에 해당 diff 요약과 커밋 메시지를 보여주고 승인을 기다린다** — `git commit`은 승인 없이 실행하지 않는다 (`.claude/rules/behavior.md` 커밋 승인 규칙).
5. 승인되면 커밋하고, 다음 그룹으로 넘어가 3~4를 반복한다.
6. 커밋 후 push는 하지 않는다.

## 커밋 메시지 규칙

```
<type>: <한 줄 요약 (한글)>

- 세부 내용 1
- 세부 내용 2
```

- type은 영어: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`, `ci`
- 요약과 세부 내용은 **한글**로 작성
- 변경 사항이 단순하면 bullet point 생략 가능
- **Co-authored-by 줄은 절대 포함하지 않는다**
