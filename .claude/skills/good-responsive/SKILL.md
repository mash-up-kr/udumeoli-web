---
name: good-responsive
description: Use when writing or modifying mobile UI layout - screen height/width variance, fixed positioning, spacing between elements - before finalizing layout
---

# Mobile Layout 안정성

`udumeoli-web`은 모바일 뷰(`MobileLayout`, `max-w-md`) 단일 타겟이다. 실제 기기마다 화면 높이·너비가 다르고, 브라우저 UI(주소창)가 접히고 펼쳐지며 뷰포트가 실시간으로 변한다. 레이아웃이 "내 화면에서만 맞는" 매직 넘버에 기대면 깨진다.

---

## 1. 뷰포트 높이는 `dvh`, `vh` 아님

모바일 브라우저는 주소창이 접히고 펼쳐질 때 `100vh`가 실제 보이는 영역보다 커져 하단이 잘린다.

```tsx
// ❌ 모바일 브라우저에서 하단 잘림
<div className="h-screen">

// ✅ 실제 보이는 뷰포트 기준
<div className="h-dvh">
// 또는
<div className="min-h-dvh">
```

프로젝트 내 기존 컨벤션: [mobile-layout.tsx](../../../src/shared/ui/mobile-layout.tsx) `min-h-dvh`, [bottom-sheet.tsx](../../../src/shared/ui/bottom-sheet.tsx) `h-[calc(100dvh-54px)]`. 새 전체화면/시트 레이아웃도 이 패턴을 따른다.

---

## 2. 화면 높이가 줄어도 요소끼리 겹치면 안 된다

`top`/`bottom` 절대 위치를 각각 고정 px로 따로 배치하면, 화면이 낮은 기기에서 두 요소가 겹친다. 하나의 flex 컨테이너로 묶어 흐름(flow)에 맡기면 화면이 줄어도 최소 간격이 보장된다.

```tsx
// ❌ 안내 문구(top-320px)와 버튼(bottom-246px)이 각자 절대 위치 —
// 화면 높이가 줄면 두 영역이 겹친다
<span className="absolute top-[320px] left-1/2 -translate-x-1/2">
  안내 문구
</span>
<span className="absolute bottom-[246px] left-1/2 -translate-x-1/2">
  확인 버튼
</span>

// ✅ 하나의 flex 컨테이너로 묶고 justify-center + gap으로 최소 간격 보장
<span className="absolute inset-x-0 top-[320px] bottom-[246px] flex flex-col items-center justify-center gap-6">
  <span>안내 문구</span>
  <span>확인 버튼</span>
</span>
```

실제 사례: 온보딩 스텝2에서 안내 문구·확인 버튼이 낮은 화면에서 겹치던 버그, `flex` 컨테이너로 묶어 해결 (`openOnboardingOverlay.tsx`, PR #84).

---

## 3. 고정폭 대신 균등 분배, 우연히 맞은 값 의심

`gap`으로 고정폭을 나열하면 컨테이너 너비가 바뀔 때 한쪽으로 쏠린다. `justify-between`처럼 컨테이너 기준 균등 분배를 쓰면 너비가 달라져도 유지된다.

```tsx
// ❌ 고정폭 패킹 — 컨테이너가 넓어지면 왼쪽으로 쏠림
<div className="flex gap-2">
  {days.map((d) => <span key={d}>{d}</span>)}
</div>

// ✅ 컨테이너 기준 균등 분배
<div className="flex justify-between">
  {days.map((d) => <span key={d}>{d}</span>)}
</div>
```

`className="w-full [&>*]:mx-auto"`처럼 자식 셀렉터로 억지로 중앙 정렬 맞추는 방식은 특정 화면 너비(예: 375px)에서만 우연히 맞아 보일 뿐이다 — 근본 원인(분배 방식)을 고친다. 실제 사례: 캘린더 요일 행이 넓은 컨테이너에서 쏠리던 버그, `gap-2` → `justify-between`으로 해결 (PR #75).

---

## 4. 재사용 컴포넌트는 `classNames` 부분 오버라이드를 `cn()`으로 병합

공통 컴포넌트가 내부 슬롯 클래스를 호출부 `classNames`로 통째로 덮어쓰게 만들면, 호출부는 레이아웃 핵심 클래스(`w-full` 등)까지 실수로 날릴 수 있다. `cn()`으로 기본값과 병합해 안전하게 부분 오버라이드만 가능하게 한다.

```tsx
// ❌ 호출부 classNames가 기본 클래스를 통째로 대체 —
// 호출부가 실수로 핵심 레이아웃 클래스를 날릴 수 있음
weekdays: classNames?.weekdays ?? "flex gap-2",

// ✅ cn()으로 기본값 + 호출부 오버라이드 병합
weekdays: cn("flex gap-2", classNames?.weekdays),
```

---

## 5. 상단/하단 안전 영역은 `env(safe-area-inset-*)` 반영

노치, 홈 인디케이터, 설치형 PWA 상태바와 겹치지 않도록 화면 최상단/최하단에 붙는 요소는 safe-area를 padding에 반영한다.

```tsx
// ✅ 프로젝트 기존 패턴 (header.tsx)
className = "pt-[calc(env(safe-area-inset-top)_+_0.75rem)]"
```

---

## 체크리스트

- [ ] `h-screen`/`min-h-screen` 대신 `h-dvh`/`min-h-dvh`를 썼는가
- [ ] `top`/`bottom` 절대 위치 두 요소가 화면이 낮아지면 겹칠 수 있는가 — 겹친다면 flex로 묶었는가
- [ ] 고정폭 `gap` 나열이 컨테이너 너비 변화에 쏠리지 않는가
- [ ] 특정 화면 너비에서만 우연히 맞는 매직 넘버/셀렉터 트릭이 있는가
- [ ] 재사용 컴포넌트의 `classNames`/`className` 오버라이드가 기본값을 지우지 않고 병합되는가
- [ ] 화면 최상단/최하단 요소가 safe-area를 반영하는가
