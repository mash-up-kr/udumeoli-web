---
name: good-code
description: Use when implementing any new feature, writing components, or reviewing code structure. Covers 4 code quality principles from Toss Frontend Fundamentals.
---

# Good Code

좋은 코드 = 변경하기 쉬운 코드. 아래 4기준으로 판단하되 상황에 맞게 적용한다. 원문: toss/frontend-fundamentals.

## 1. 가독성: 한 번에 고려할 맥락을 줄인다

- 같이 실행되지 않는 코드는 분리한다. `isViewer ? <ViewerSubmitButton /> : <AdminSubmitButton />`처럼 역할별 컴포넌트로 나눈다. 한 컴포넌트에서 두 경우를 동시에 생각하게 하지 않는다.
- 구현을 감싸 의도를 이름으로 드러낸다. 인증 체크 로직을 페이지에 노출하지 말고 `<AuthGuard>`.
- 복잡한 조건식은 이름 붙인 변수로 (`isSameCategory && isPriceInRange`). `arr.map(x => x * 2)` 수준은 그대로.
- 매직 넘버는 이름 붙인 상수 (`ANIMATION_DELAY_MS = 300`).
- 조건을 이해하려고 다른 파일로 가야 하면 호출 지점에 인라인한다.
- 중첩 삼항 금지. IIFE + if:
  ```ts
  const status = (() => {
    if (A && B) return "BOTH"
    if (A) return "A"
    if (B) return "B"
    return "NONE"
  })()
  ```
- 범위 비교는 수학 표기 순서: `80 <= score && score <= 100`.
- 한 훅/함수가 여러 실행 맥락을 담당하면 분리한다. `usePageState()` 전체 대신 `useCardIdQueryParam()`.

## 2. 예측 가능성: 이름만 봐도 동작을 안다

- 같은 이름 = 같은 동작. `http.get`이 인증 헤더를 몰래 붙이면 `getWithAuth`로 이름에 드러낸다.
- 비슷한 역할의 함수는 반환 타입을 통일한다. 검증 함수가 하나는 `boolean`, 하나는 객체면 사고다 (객체는 항상 truthy). `{ ok: true } | { ok: false; reason: string }`.
- 숨은 사이드이펙트 금지. `fetchBalance`가 로깅까지 하지 않는다. 로깅은 호출 지점에서 명시.

## 3. 응집도: 함께 바뀌는 코드는 함께 둔다

- 도메인 기반 디렉토리. 타입별(`components/`, `hooks/`, `utils/`) 분산 금지. 공통만 최상위.
- 상수는 의미와 함께 한 곳에.
- 폼: 필드가 독립 검증·재사용되면 필드 단위, 필드 간 의존이 있으면 폼 단위(zod 스키마).

## 4. 결합도: 수정 영향 범위를 작게

- 훅/함수는 책임 하나.
- 영향 범위가 다른 중복은 분리 유지. 지금도 앞으로도 같을 게 확실할 때만 공통화한다.
- Props drilling: 1) `children` 조합 패턴 먼저, 2) 그래도 안 되면 Context.

## 체크리스트

- [ ] 같이 실행되지 않는 코드를 같은 함수/컴포넌트에 뒀나?
- [ ] 이름만 봐도 동작과 사이드이펙트를 예측할 수 있나?
- [ ] 함께 바뀌는 파일이 같은 디렉토리에 있나?
- [ ] 훅/함수 하나가 여러 역할을 하나?
- [ ] Props drilling 3단계 이상이면 조합/Context를 검토했나?
