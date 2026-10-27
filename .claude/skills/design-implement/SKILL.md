---
name: design-implement
description: |
  Figma 시안을 design-implementer 에이전트에 위임해 udumeoli-web 코드로 구현한다.
  TRIGGER when: user invokes /design-implement directly, or gives a figma.com URL with a request to implement it.
---

# Design Implement

Figma 시안을 `design-implementer` 에이전트에 위임한다. 직접 코드를 수정하지 않는다.

## 입력

`$ARGUMENTS`에 figma URL(또는 노드 정보)과 구현 대상 설명을 받는다. figma URL이 없으면 사용자에게 요청한다.

## 절차

1. `$ARGUMENTS`에서 figma URL/노드, 구현 대상 화면·컴포넌트를 파악한다.
2. 에이전트가 탐색하지 않도록 호출자가 미리 찾아 넘긴다: 대상 페이지·컴포넌트 경로, `src/shared/ui` · `src/widgets`의 재사용 후보(이름 grep), 디자인 토큰 파일 `src/app/styles.css`.
3. `design-implementer` 에이전트를 호출한다:

   ```
   Agent: design-implementer
   Task: "<figma 출처 + 구현 대상 요약>"
   Context: "<대상 경로, 재사용 후보, 토큰 파일>"
   ```

4. 에이전트 보고를 그대로 사용자에게 출력한다. "사람 확인 필요" 또는 "미완료" 항목은 목록으로 별도 강조한다.

## 원칙

- 직접 구현하지 않는다. 항상 `design-implementer`에게 위임한다.
- 에이전트 결과를 요약하거나 생략하지 않는다. 토큰 매핑, 시각 검증 차이, 확인 필요 항목은 전부 전달한다.
