---
name: good-responsive
description: Use when writing or modifying mobile UI layout - screen height/width variance, fixed positioning, spacing between elements - before finalizing layout
---

# Mobile Layout 안정성

단일 타겟: 모바일 뷰(`MobileLayout`, `max-w-md`). 기기마다 높이·너비가 다르고 주소창 접힘으로 뷰포트가 실시간으로 변한다. "내 화면에서만 맞는" 매직 넘버는 깨진다.

## 1. 뷰포트 높이는 `dvh`

`h-screen`/`100vh`는 주소창이 펼쳐지면 하단이 잘린다. `h-dvh` / `min-h-dvh`를 쓴다. 기존 패턴: `shared/ui/mobile-layout.tsx`의 `min-h-dvh`, `shared/ui/bottom-sheet.tsx`의 `h-[calc(100dvh-54px)]`.

## 2. 절대 위치 두 요소는 낮은 화면에서 겹친다

`top`/`bottom` 고정 px로 따로 배치하지 말고 하나의 flex 컨테이너로 묶는다. 흐름에 맡기면 화면이 줄어도 최소 간격이 보장된다.

```tsx
// ❌ 각자 절대 위치 → 낮은 화면에서 겹침
<span className="absolute top-[320px] ...">안내 문구</span>
<span className="absolute bottom-[246px] ...">확인 버튼</span>

// ✅ 한 컨테이너 + justify-center + gap
<div className="absolute inset-x-0 top-[320px] bottom-[246px] flex flex-col items-center justify-center gap-6">
  <span>안내 문구</span>
  <span>확인 버튼</span>
</div>
```

(온보딩 스텝2 겹침 버그, `openOnboardingOverlay.tsx`, PR #84)

## 3. 고정폭 나열 대신 균등 분배

`flex gap-2`로 고정폭을 나열하면 컨테이너가 넓어질 때 한쪽으로 쏠린다. `justify-between`으로 컨테이너 기준 분배. `[&>*]:mx-auto` 같은 셀렉터 트릭은 특정 너비(375px 등)에서만 우연히 맞는다. 분배 방식 자체를 고친다. (캘린더 요일 행, PR #75)

## 4. 재사용 컴포넌트의 `classNames`는 `cn()`으로 병합

`classNames?.weekdays ?? "flex gap-2"`는 호출부가 핵심 레이아웃 클래스(`w-full` 등)까지 날린다. `cn("flex gap-2", classNames?.weekdays)`로 기본값과 병합한다.

## 5. 최상단/최하단 요소는 safe-area 반영

노치·홈 인디케이터·PWA 상태바와 겹치지 않게 padding에 반영한다. 기존 패턴(`header.tsx`): `pt-[calc(env(safe-area-inset-top)_+_0.75rem)]`.

## 체크리스트

- [ ] `h-screen`/`min-h-screen` 대신 `h-dvh`/`min-h-dvh`를 썼나
- [ ] 절대 위치 두 요소가 낮은 화면에서 겹칠 수 있으면 flex로 묶었나
- [ ] 고정폭 `gap` 나열이 너비 변화에 쏠리지 않나
- [ ] 특정 너비에서만 맞는 매직 넘버/셀렉터 트릭이 없나
- [ ] `classNames`/`className` 오버라이드가 기본값을 지우지 않고 병합되나
- [ ] 최상단/최하단 요소가 safe-area를 반영하나
