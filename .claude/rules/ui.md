---
paths:
  - "src/**/*.tsx"
  - "src/app/styles.css"
---

## UI 구현 계약

기준 뷰포트는 Figma 프레임 375×812. CSS px = Figma px 1:1. 구현은 기준 뷰포트에서 시안과 수치가 같아야 하고, 다른 기기에서는 깨지지 않게 늘어난다.

- 화면 크기는 `100dvh`/`100vw` 대신 `var(--app-vh)`/`var(--app-vw)`. 데스크톱(폭 480px 이상 + 마우스)은 앱이 440×956 이하의 폰 프레임 안에서 렌더되고 이 변수가 프레임 크기로 덮인다. 데스크톱 전용 레이아웃을 만들지 않는다. `frame:`/`desktop:` 변형은 DesktopGuide 전용.
- 가로: 컨테이너는 `w-full` + 시안의 좌우 패딩. 고정 px는 아이콘·버튼 높이 같은 내재 크기만. 비율이 중요한 이미지·지도·카드는 `aspect-[w/h]` + `w-full`. 나열은 `justify-between`/`flex-1`로 분배한다. `gap` + 고정폭 나열 금지.
- 세로: 시안의 y 좌표를 `top-[Npx]`로 옮기지 않는다. 시안에서 "상단 블록 / 가변 영역 / 하단 고정"을 읽어 `flex-col` + `flex-1`/`justify-between`으로 배분한다. 높이에 따라 줄어야 하는 여백은 `clamp(min, calc(var(--app-vh) - Kpx), max)` (K = 812 − 시안값. 예: `features/recap/ui/openRecapOverlay.tsx`). 절대 위치는 오버레이·배지처럼 흐름 밖 요소에만.
- 하단 고정 요소는 `pb-[max(env(safe-area-inset-bottom),Npx)]`, 상단은 `pt-[calc(env(safe-area-inset-top)+Npx)]`.
- 타이포는 토큰(`text-h3`, `text-b7` 등)으로 px 고정. vw 스케일 금지. 색상은 토큰, 임의 hex 금지.
- 상세 패턴과 체크리스트: [good-responsive](../skills/good-responsive/SKILL.md).

## 검증 (변경 크기에 맞춰, 과하게 하지 않는다)

```bash
pnpm ui:shot <route> [--viewports base] [--wait "<selector>"] [--measure "<sel>,<sel>"]   # → .ui-shots/
```

| 변경                                                    | 검증                                                               |
| ------------------------------------------------------- | ------------------------------------------------------------------ |
| 문구·색·아이콘·조건 분기만 (레이아웃 불변)              | 없음. typecheck만                                                  |
| 한 컴포넌트 안의 간격·크기·정렬 조정                    | `--viewports base` 1장, 바뀐 요소만 `--measure`. 1회               |
| 새 화면·섹션 레이아웃·절대 위치·높이 계산·전체화면 요소 | base·narrow·tall (전체화면이면 frame 추가) + `--measure`. 최대 2회 |

- base(375×812)는 Figma 스크린샷과 나란히 보고 위치·크기·간격 차이를 적는다. `--measure` bounding box를 Figma `get_metadata` 값과 대조해 2px 초과 차이만 고친다.
- narrow·tall·frame은 겹침·잘림·쏠림·빈 공간만 본다. 기준 뷰포트와 같을 필요는 없다.
- dev 서버는 첫 실행에 20~30초 부팅 후 유지된다. 작업이 끝나면 `pnpm ui:shot --stop`. 로그인 필요 페이지는 목 세션으로 자동 렌더된다.
