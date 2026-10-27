---
name: good-a11y
description: Use when writing or modifying UI components, interactive elements, forms, or any HTML structure - before finalizing markup
---

# Accessibility (a11y)

시맨틱 HTML이 기본이다. 키보드 탐색, 우클릭 새 탭, Enter 제출이 거기서 나온다. jsx-a11y 린트는 설정돼 있지 않다. 아래는 수동 준수.

## 4원칙

1. 올바른 구조: 버튼 안 버튼, `<main>`에 `role="button"` 같은 잘못된 중첩 금지. 클릭 가능한 건 `<button>`. 부득이 `<div>`면 `role="button" tabIndex={0}` + 키보드 핸들러.
2. 의미 전달: `<img>`는 `alt` 필수 (장식은 `alt=""`). 아이콘만 있는 버튼은 `aria-label`.
3. 예측 가능한 인터랙션: 입력은 `<form onSubmit>`으로 감싼다 (Enter 제출). 링크는 `<a>` (새 탭 열기). `<input>`은 `<label htmlFor>`와 연결.
4. 시각 정보 보완: 색상만으로 상태 표현 금지. 텍스트나 아이콘을 병행.

## 체크리스트

- [ ] 클릭 요소가 `<button>` 또는 `role="button"` + `tabIndex={0}`인가
- [ ] `<img>`에 alt 있나 (장식용은 `alt=""`)
- [ ] 아이콘 버튼에 `aria-label` 있나
- [ ] 폼 입력에 `<label>` 연결됐나
- [ ] 색상만으로 상태를 표현하지 않나
- [ ] `tabIndex` 양수가 없나 (0 또는 -1만)
