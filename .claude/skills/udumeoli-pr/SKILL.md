---
name: udumeoli-pr
description: |
  Creates a GitHub Pull Request by analyzing branch changes and filling in the project PR template.
  TRIGGER when: user invokes /udumeoli-pr directly, or says 'PR 만들어줘', 'PR 작성해줘'.
---

# PR 생성

현재 브랜치의 변경사항을 분석하여 프로젝트 PR 템플릿에 맞는 Pull Request를 생성합니다.

## 작업 절차

1. `git log main...HEAD --oneline`과 `git diff main...HEAD`로 변경사항 전체를 파악한다.
2. 변경사항을 바탕으로 PR 내용을 작성한다.
3. `gh pr create` 명령으로 PR을 생성한다. push가 필요하면 먼저 push한다.

## PR 템플릿 작성 규칙

아래 템플릿 구조를 그대로 사용하며, 각 섹션을 다음 기준으로 채운다:

```
## 작업 내용

- <변경한 것을 bullet point로, 한글로 작성>
- <무엇을 왜 했는지 중심으로>

## 추가 설명

- <구현 상의 선택, 주의사항, 리뷰어가 알아야 할 맥락 등>
- <없으면 `-` 그대로 둔다>

## 연결 이슈

- close #<이슈 번호 — 알 수 없으면 번호 없이 `- close #` 그대로 둔다>
```

- 모든 내용은 **한글**로 작성한다.
- 추측하지 말고 코드와 커밋 이력에서 파악된 사실만 기재한다.
- PR 제목은 `<type>: <한 줄 요약 (한글)>` 형식으로 작성한다 (프로젝트 커밋 규칙과 동일).

## 실행

```bash
gh pr create --title "<title>" --body "<filled template>"
```

base 브랜치는 `main`으로 한다.
