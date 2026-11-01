# Pinnned

![Pinnned — 친구와 함께 만드는 여행 기록 지도](.github/readme/hero.jpg)

**우리, 어디까지 같이 가봤지?**

Pinnned는 친구·연인·가족과 함께 다녀온 여행을 스티커와 사진으로 지도 위에 같이 기록하는 여행 기록 서비스입니다.
한국 지도 위에 우리 팟이 다녀온 지역마다 스티커가 하나씩 쌓입니다.

🔗 **https://www.pinnned.co.kr** (모바일 웹 · PWA)

<br/>

## 왜 만들었나

같이 여행을 다닐수록 함께한 장소는 늘어나는데, 시간이 지나면 "우리 어디 갔었지?"가 됩니다.
사진은 각자 폰에, 장소는 기억 어딘가에 흩어져 있어 **우리가 다녀온 여행을 하나의 기록으로 돌아보기** 어렵습니다.

기존 서비스는 사진 기록, 지도 위 기록까지는 잘 지원하지만 두 가지가 비어 있었습니다.

- 친구·여행팟 단위로 기록이 **누적**되는 것
- **함께** 기록하는 경험

Pinnned는 이 두 칸을 채웁니다. 우리만의 여행팟을 만들고, 여행지마다 사진 한 장과 키워드를 지도에 남기고, 여행 앨범에서 함께한 기록을 같이 돌아봅니다.

<br/>

## 핵심 기능

### 1. 여행팟

가족·연인·친구와 우리만의 여행팟을 만듭니다. 초대코드로 최대 6명까지 함께하고, 팟 여러 개에 동시에 속할 수 있습니다.

### 2. 여행 지도

![여행 지도](.github/readme/feature-map.jpg)

국가 → 도 → 시, 3단계 줌으로 지도를 탐색합니다. 기록을 남기면 해당 지역에 스티커와 색으로 다녀온 흔적이 남습니다.
첫 진입 튜토리얼, 기록 없이 돌아왔을 때의 "기록하기" 툴팁으로 첫 기록을 유도합니다.

### 3. 지도에 같이 기록하기

![여행 기록](.github/readme/feature-record.jpg)

여행지마다 **키워드 하나 + 사진 한 장 + 한 줄 소개**를 남기면 핀이 꽂힙니다.
팟원 각자가 고른 키워드가 모여 "우리의 여행은 디저트 투어"처럼 우리 여행의 대표 키워드가 됩니다.

### 4. 여행 앨범

![여행 앨범](.github/readme/feature-album.jpg)

흩어진 기록을 한눈에 봅니다. 전체 앨범 → 지역 앨범 → 사진 뷰어로 들어가며, 팟원별 사진과 한 줄 소개를 확인합니다.
아직 안 올린 지역은 빈 자리로 보여서 자연스럽게 "너도 올려"가 됩니다.

### 5. 리캡

![리캡](.github/readme/feature-recap.jpg)

지금까지 우리 팟이 만든 핀을 한 장의 카드로 묶어 이미지로 저장합니다. 인스타그램 스토리에 바로 올릴 수 있는 규격입니다.

<br/>

## 기술

| 영역   | 스택                                                                       |
| ------ | -------------------------------------------------------------------------- |
| 프론트 | TanStack Start(SSR) · React 19 · TypeScript · Tailwind 4 · shadcn/ui · PWA |
| 지도   | Google Maps · TopoJSON(빌드 시 단순화) → GeoJSON 지역 경계 레이어          |
| 데이터 | GraphQL ([udumeoli-spring](https://github.com/mash-up-kr/udumeoli-spring)) |
| 구조   | FSD 레이어: `app · pages · widgets · features · entities · shared`         |
| 품질   | Vitest · ESLint · Storybook · Playwright 스크린샷(`pnpm ui:shot`)          |

<br/>

## 개발

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm storybook    # http://localhost:6006

pnpm typecheck · pnpm lint · pnpm test · pnpm build
pnpm ui:shot <route> [--measure "<sel>"]   # 화면 스크린샷 → .ui-shots/
```

`.env.example`을 복사해 `.env.local`을 만들고 API·지도 키를 채웁니다.
`VITE_ANALYTICS_API_URL`은 비워 두면 분석 이벤트를 보내지 않습니다.

<br/>

![Thank you for watching!](.github/readme/thanks.jpg)
