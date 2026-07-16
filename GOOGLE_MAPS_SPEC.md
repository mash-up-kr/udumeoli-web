# Google Maps 이식 스펙 (`/map-google` 스파이크, #76)

MapLibre 기반 여행 지도(`/map`, `src/widgets/travel-map`)를 Google Maps JavaScript API로
이식하기 위한 기준 문서. **`/map`의 모든 기능·플로우가 원본 스펙**이며, 이 문서는
(1) 기능별 동작 정의, (2) MapLibre ↔ Google API 매핑, (3) 현재 이식 현황과 남은 gap,
(4) gap별 구현 가이드를 담는다. 이 문서만 보고 이식을 이어갈 수 있어야 한다.

- 기준 시점: main `c8c7da0` (PR #79 "지도 UI 및 기능 개선") 병합 직후
- 원본: `src/widgets/travel-map/ui/TravelMapImpl.tsx`
- 이식본: `src/widgets/travel-map-google/` (라우트 `/map-google`)

---

## 1. 아키텍처 / 파일 맵

### 공용 (지도 라이브러리 무관 — 두 구현이 그대로 공유)

| 파일                                              | 역할                                                                                                                                                                                                   |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/shared/lib/loadKoreaGeoJson.ts`              | TopoJSON 2종(시군구/도) fetch → 병합 GeoJSON 생성. 구 있는 시는 `topojson merge`, 광역시는 도 데이터에서 추출. **모든 링 폐합(closeRings) 포함** — Google `addGeoJson`이 스펙 위반 시 throw하므로 필수 |
| `src/shared/lib/geo.ts`                           | `computeCentroid`(면적 가중 shoelace, 최대 폴리곤 기준), `computeFeatureBBox`, `getSlotOffset`(원형 분포 — 구버전, 파티 슬롯은 이제 `partySlotOffset` 사용)                                            |
| `src/shared/ui/photo-tile.tsx`                    | 사진 핀/파티 슬롯 타일 (지역명·닉네임 칩 + 정사각 이미지)                                                                                                                                              |
| `src/shared/ui/region-card-carousel.tsx`          | 하단 커브드 캐러셀 (지역당 최신 사진 1장, `Ndays` = 고유 날짜 수)                                                                                                                                      |
| `src/features/region-decorate/`                   | 첫 여행 등록 플로우 (색상→날짜→사진). `useDecorateStore`(region/step/**preview**), `partySlotOffset`(피그마 실측 1~6인 배치)                                                                           |
| `src/features/photo-gallery/`                     | `GalleryPanel`(지역 상세 하단 패널, peek 244px), `openPhotoViewer`                                                                                                                                     |
| `src/widgets/travel-map/model/popular-regions.ts` | 관광지 상위 30 지역 Set — "+" 버튼 줌 2단계 노출 필터. **위치가 MapLibre 위젯 안이라 Google에서 재사용하려면 shared로 이동 필요**                                                                      |
| `src/entities/region`                             | `fillsByPot` 스토어(팟별 색칠), `formatRegionName`(행정 접미사 제거: "강릉시"→"강릉")                                                                                                                  |
| `src/entities/photo`                              | `useAllPhotos(potId)`, `usePhotoUploadStore.addPhoto` — **Photo에 `potId` 필수**                                                                                                                       |

### Google 전용

| 파일                                                       | 역할                                                                              |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `src/widgets/travel-map-google/ui/TravelMapGoogle.tsx`     | SSR 회피 동적 로드 래퍼 (MapLibre `TravelMap.tsx`와 동일 패턴)                    |
| `src/widgets/travel-map-google/ui/TravelMapGoogleImpl.tsx` | 본체. `APIProvider` + `<GoogleMap>` + `MapController`(비주얼 없는 지도 제어 자식) |
| `src/widgets/travel-map-google/lib/regionDataLayer.ts`     | `google.maps.Data` 래퍼 — feature-state 대체 (아래 3.2)                           |
| `src/widgets/travel-map-google/lib/ImageFillOverlay.ts`    | `OverlayView` 기반 canvas 이미지-fill (아래 3.3)                                  |
| `src/pages/map-google/ui/MapGooglePage.tsx`                | MapPage 복제 (위젯만 스왑)                                                        |
| `src/app/routes/map-google.tsx`                            | 라우트                                                                            |

### 환경 변수 (`.env`)

```
VITE_GOOGLE_MAPS_API_KEY=   # Google Cloud Console → Maps JavaScript API 키 (필수)
VITE_GOOGLE_MAPS_MAP_ID=    # 선택. 비우면 DEMO_MAP_ID 폴백 (AdvancedMarker는 mapId 필수)
```

키 없으면 안내 메시지만 렌더, `/map`엔 영향 없음.

---

## 2. 기능 스펙 (원본 `/map` 기준 — 이것이 이식 목표)

### 2.1 줌 단계

```
BOUNDARY_ZOOM = 7.5   # 경계선 + "+" 버튼 등장
ZOOM_COLOR    = 8.5   # (구: 핀 2개·72px — #79에서 폐기, 상수만 잔존)
PARTY_ZOOM    = 9.5   # 지역 상세(파티 슬롯) 진입 = maxZoom
PARTY_ENTER   = 9.49  # 관성 줌이 9.4999에서 멈춰도 3단계 인정 (epsilon 0.01)
getZoomStage(z): 0(<7.5) / 1(≥7.5) / 2(≥8.5) / 3(≥PARTY_ENTER)
```

- 초기 뷰 `{lng 127.8, lat 36.2, zoom 6.5}`, `maxZoom=PARTY_ZOOM`
- **소수점 줌 필수** — Google은 `isFractionalZoomEnabled: true` 명시해야 함 (없으면 정수 스냅되어 9.5 경계 죽음)

### 2.2 지역 폴리곤 레이어

- fill: `feature-state.color` 있으면 그 색, 없으면 ACCENT(#6cbcf9)
- fill-opacity: `active 0.15 / hasColor 0.6 / hasPhoto 0.08 / 그 외 0` ← **#79에서 0.7→0.6**
- line(경계선): `minzoom 7.5`, active면 ACCENT·2.5px·op1, 아니면 #aaaaaa·0.9px·op0.65
- 등록 플로우 강조선(MUNI_DASH): **실선 width 2** ← #79에서 dasharray 제거됨.
  색 = `decoratePreview.stroke ?? DASH_DARK(#232936)` — 스와치 탭 즉시 해당 색 500으로 변경

### 2.3 사진 핀 (#79 신규 정책 — Figma 1319-13186 #1)

- **지역당 최신 사진 1장만, 크기 60px 고정, 줌 레벨과 무관** (구: 줌별 1~2장·60/72px — 폐기)
- 위치: 지역 centroid (없으면 사진 좌표 폴백), anchor bottom, offset 없음
- 칩 라벨: `formatRegionName(region)` — "양양군"→"양양"
- 노출 조건: `!selectedRegion && !decorating`
- 클릭: `setSelectedRegion(region)` + `flyToRegion(centroid)` → 지역 상세 진입

### 2.4 "+" 꾸미기 버튼 (#79 신규 디자인·필터)

- 노출: `zoomStage ≥ 1 && !selectedRegion && !decorating`, 뷰포트 내 centroid만
- 필터: 색칠 없음 && 사진 없음 && `(zoomStage ≥ 2 || POPULAR_REGIONS.has(name))`
  — 줌 1단계(7.5~8.5)는 관광지 상위 30개만, 2단계(8.5+)부터 전 지역
- 디자인: 28px(size-7) 원형 흰 배경(white/70) + `border-[2.5px] border-stroke-neutral-bold` + `icon-add.svg`(size-5), 아래 `formatRegionName` 라벨 `text-h9 [text-shadow:0_0_8px_white]`
- 클릭: `startDecorate(name)` — 등록 플로우 진입

### 2.5 지역 폴리곤 클릭 (#79 신규 분기)

```
if (decorating) 무시
if (zoom < BOUNDARY_ZOOM) 무시            # 초기 줌에선 클릭 이동 없음
if (색칠 없음 && 사진 없음) startDecorate  # 안 가본 지역 → 등록 플로우
else setSelectedRegion + flyToRegion       # 가본 지역 → 지역 상세
```

배경(지역 밖) 클릭: `zoom < PARTY_ENTER`면 `setSelectedRegion(null)`.
(Google: Data 클릭이 map 클릭과 겹치지 않도록 `featureClickedRef` 플래그로 방어)

### 2.6 카메라 이동

- `flyToRegion`: `flyTo({ center, zoom: PARTY_ZOOM, duration 350, offset: [0, -GALLERY_PEEK/2] })`
  — **GALLERY_PEEK=244의 절반만큼 위로 보정** (하단 갤러리 패널 제외 영역의 세로 중앙에 지역 배치)
  — `flyingRef` + 600ms 타임아웃: 카메라가 이미 목표면 moveend 미발생 대비
- `handleBackToHome`(지역 상세 뒤로가기): 초기 뷰로 flyTo(duration 600) + 선택 해제
- Google 제약: `panTo`/`fitBounds`에 duration 없음 → 즉시 이동 (수용된 gap).
  offset은 `panToBounds` 또는 panTo 후 `panBy(0, GALLERY_PEEK/2)`로 근사

### 2.7 지역 상세 자동 진입/이탈 (스크롤 줌)

- move(RAF 스로틀, 최신 viewState는 ref 보관) 시:
  - `zoom ≥ PARTY_ENTER`: 화면 중앙 최근접 centroid 탐색 →
    **가본 지역(색칠∥사진)이면 선택, 안 가본 지역이면 null 유지** ← #79 visited 필터
  - `zoom < PARTY_ENTER`: 선택 해제
  - `flyingRef`·`decorating` 중엔 스킵
- Google: move 스트림 대신 `idle` 이벤트에서 판정 (제스처 종료 시점, 수용된 근사)

### 2.8 지역 상세 (detailRegion = `!decorating && zoomStage===3 && selectedRegion`)

- 상단: 뒤로가기 ButtonIcon + `formatRegionName` 지역명(text-h3). 갤러리 확장 시 숨김
- 하단: `GalleryPanel` (peek 244px, 드래그 확장). `onRegionDetailChange`로 페이지 헤더 전환
- 파티 슬롯 (지도 마커, centroid + `partySlotOffset` 오프셋):
  - **매칭: 그 지역 최신 여행 일자 사진만** (갤러리 최신 행과 동일 기준) ← #79
  - **정렬: 내 슬롯이 마지막(우하단)** — `[...members].sort(내가 마지막)` ← #79
  - **배치: `partySlotOffset(total, index)`** — 1~6인 피그마 실측 좌표, 7+는 원형 폴백 ← #79
  - 내 슬롯 닉네임 = 세션 닉네임 (목 멤버 닉네임 아님) ← #79
  - 사진 있는 슬롯 클릭 → `openPhotoViewer(url)`
  - 내 빈 슬롯("+"): `pickImageFile` → **날짜 선택 없이** 그 지역 최신 여행 일자에 합류
    (사진 없으면 오늘), `addPhoto({..., potId})` 후 `showToast("업로드가 완료됐어요", check, bottom-[256px])` ← #79 (구: openDatePickerSheet — 폐기)
  - 남의 빈 슬롯: zzz 아이콘 80px

### 2.9 첫 여행 등록 플로우 (decorating)

- 진입: "+" 클릭 또는 안 가본 지역 폴리곤 클릭 → `useDecorateStore.start(region)`
- 지도: 제스처 전부 잠금, `fitBounds(bbox, padding {top 170, bottom 330, left/right 48}, maxZoom PARTY_ZOOM, duration 500)`, MUNI_DASH 필터=해당 지역
- 지역명 마커: centroid에 `formatRegionName`, **text-h2** ← #79 (구 h1)
- **색상 미리보기** ← #79 신규: 스와치 탭 즉시 `decoratePreview {fill(100계열), stroke(500계열)}` 세팅 →
  지도가 그 지역을 `fill`로 즉시 칠하고(feature-state color) 강조선을 `stroke`로 변경.
  플로우 이탈/색 변경 시 저장값으로 복원 (cleanup에서 stored fill 재적용)
- 플로우 UI(`RegionDecorateFlow`)는 지도 무관 오버레이 — 그대로 재사용
- **종료 처리** ← #79 신규: 플로우 닫힐 때 그 지역에 사진이 생겼으면(=커밋 완료)
  `setSelectedRegion(region)` + `flyToRegion` → 지역 상세로 복귀. 취소면 아무것도 안 함
- 기존 지도 UI(핀·"+"·슬롯·캐러셀·앱 헤더) 전부 숨김

### 2.10 색칠 / 이미지-fill

- 색칠: `fillsByPot[currentPotId]` 구독 → 지역별 feature-state `{color, hasColor}` 동기화
- 이미지-fill: canvas 오버레이 — 폴리곤 클리핑 + contain 스케일 + alpha 0.85, DPR 반영,
  fills는 **ref 경유**로 최신값 참조 (클로저 고정 금지), move마다 RAF 스로틀 재드로우
- hasPhoto feature-state: photos의 region Set과 diff 동기화

### 2.11 하단 캐러셀

- `zoomStage === 0 && !decorating`에서만 노출 (슬라이드다운 퇴장)
- 카드 클릭: `setSelectedRegion` + `flyToRegion` (centroid, 없으면 REGION_CENTERS 폴백)

### 2.12 페이지 통합 (MapGooglePage = MapPage 복제)

- `RequireAuth` (persist hydration 대기 포함)
- 앱 헤더(PHOTATO/팟 셀렉터): `!decorating && detailRegion === null`일 때만

---

## 3. MapLibre ↔ Google API 매핑

### 3.1 기본

| MapLibre                                   | Google                                                                                                                                              | 비고                                                    |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `<Map>` (react-map-gl)                     | `<APIProvider libraries={["marker"]}>` + `<Map mapId gestureHandling="greedy" disableDefaultUI clickableIcons={false}>` (@vis.gl/react-google-maps) | mapId 없으면 AdvancedMarker 불가                        |
| `<Marker>`                                 | `<AdvancedMarker anchorPoint>`                                                                                                                      | offset prop 없음 → 자식 div `transform: translate(x,y)` |
| `onMove` (연속)                            | `zoom_changed` + `idle` 리스너                                                                                                                      | move 스트림 없음 — 연속 판정은 idle로 근사              |
| `map.flyTo({duration, offset})`            | `panTo` + `setZoom` (+`panBy`로 offset 근사)                                                                                                        | 애니메이션 duration 제어 불가                           |
| `map.fitBounds(bbox, {padding, duration})` | `map.fitBounds(latLngBounds, padding)`                                                                                                              | duration 없음                                           |
| `map.getBounds().contains([lng,lat])`      | `bounds.contains({lat, lng})`                                                                                                                       | 인자 순서 주의                                          |
| `map.project(lngLat)`                      | `OverlayView.getProjection().fromLatLngToDivPixel(new LatLng(lat,lng))`                                                                             | 3.3 참고                                                |
| `dragPan.disable()` 등 6종                 | `map.setOptions({ gestureHandling: "none" / "greedy" })`                                                                                            | 한 번에 잠금                                            |
| `queryRenderedFeatures(point)`             | Data 클릭 리스너 + map 클릭 리스너 + `featureClickedRef` 플래그                                                                                     | Data 클릭은 map으로 전파 안 됨(방어용)                  |
| `maxZoom` + 소수점 줌                      | `maxZoom` + **`isFractionalZoomEnabled: true` 필수**                                                                                                | 미설정 시 정수 스냅                                     |

### 3.2 feature-state → regionDataLayer

Google `Data`엔 feature-state·data-driven expression이 없다. 대체 설계:

- `createRegionDataLayer(map, geojson, {accent, initialZoom, onFeatureClick})`
- 지역별 `RegionVisualState {hasColor, color, hasPhoto, active, decorateColor}`를 JS Map에 보관
- 상태 변경 시 `computeStyle(state, zoom, accent)`로 전체 스타일 계산 후
  `data.overrideStyle(feature, style)` 재적용 (`sync(patch)` / `syncZoom(zoom)`)
- 경계선 minzoom 게이팅: zoom < BOUNDARY_ZOOM이면 strokeWeight 0
- base `setStyle({clickable:true, fillOpacity:0, strokeOpacity:0})`
- **주의**: `addGeoJson`은 링 폐합·스펙을 엄격 검증하고 위반 시 throw —
  `loadKoreaGeoJson`의 closeRings가 전제. **초기화 Promise에 `.catch` 필수** (조용한 전멸 방지)

### 3.3 이미지-fill → ImageFillOverlay

- `createImageFillOverlay(getFills, getGeojson)` 팩토리 — **클래스 정의를 함수 안에 가둠**:
  `extends google.maps.OverlayView`는 선언 시점에 `google` 전역을 평가하므로 SDK 로드 전
  모듈 import되면 "google is not defined"로 죽는다 (APIProvider가 SDK를 비동기 주입)
- draw(): bounds NE/SW를 DivPixel로 투영해 canvas 위치·크기 산정 (Google 오버레이 pane은
  지도 이동 시 CSS transform으로 움직여 매 draw마다 재배치 필요), 폴리곤 클리핑 로직은 MapLibre와 동일
- `idle`마다 draw, fills 변경 시 `loadPendingImages` 후 draw

### 3.4 React 통합 주의점

- **지도 인스턴스별 초기화**: StrictMode 이중 마운트에서 vis.gl이 지도를 파괴·재생성 →
  `initedRef` 1회 가드는 새 인스턴스 초기화를 스킵시킴. `useEffect([map])` +
  cleanup(리스너 remove, dataLayer.destroy, overlay.setMap(null), ref null)으로 관리
- 리스너 콜백은 등록 시점 클로저 고정 → `selectedRegionRef`/`decoratingRef`/`fillsRef` 등 ref 경유
- `Map` import 충돌: `Map as GoogleMap` alias (JS 빌트인 Map 가림 방지)
- tsconfig `types`: `"google.maps"` 추가돼 있음 (`@types/google.maps`)

---

## 4. 이식 현황 (2026-07-15 갱신 — main c8c7da0 기준 gap 12건 전부 반영 완료)

### ✅ 동기화 완료

- 지도 로드·GeoJSON 병합·링 폐합, centroid/bbox 계산 (공용 lib)
- Data 레이어 색칠/active/hasPhoto, **fill-opacity 0.6**(hasColor)
- 이미지-fill 오버레이 (fillsRef 최신값 참조 포함)
- 마커 4종 렌더 (사진 핀 60px 고정 1장/지역, "+"(POPULAR_REGIONS 필터+신규 디자인), 지역명(text-h2), 파티 슬롯)
- 지역 상세: detailRegion·헤더·GalleryPanel·뒤로가기·onRegionDetailChange, formatRegionName 라벨 전면 적용
- 캐러셀 노출/클릭
- 소수점 줌 + PARTY_ENTER epsilon + idle 최근접 자동 선택/해제 (**visited 필터 적용**)
- 폴리곤 클릭: zoom<BOUNDARY_ZOOM 무시, 미방문 지역 → startDecorate 분기
- 등록 플로우: 진입 잠금·fitBounds·RegionDecorateFlow 마운트, **decoratePreview 즉시 미리 칠하기(fill/stroke)**, **완료 후 지역 상세 자동 복귀**
- flyToRegion: 목표 줌(PARTY_ZOOM) 기준 mercator 계산으로 center 위도를 GALLERY_PEEK/2px만큼 보정해 panTo (panBy는 호출 시점 줌 투영이라 setZoom과 함께 쓰면 어긋남)
- 등록 플로우 지역명 마커: Google 기본 지도의 지명 라벨과 겹쳐 보여 pill 배경(white/85) 적용 (MapLibre는 text-shadow만)
- 파티 슬롯: 최신 여행 일자만 매칭·내 슬롯 마지막 정렬·세션 닉네임·`partySlotOffset`(피그마 그리드) 배치
- 내 슬롯 업로드: 날짜 선택 없이 최신 일자 자동 합류 + 완료 토스트
- 팟 분리(fillsByPot, useAllPhotos(potId), addPhoto potId)
- StrictMode 안전 초기화/cleanup, 배경 클릭 해제, 앱 헤더 숨김
- `POPULAR_REGIONS`는 `entities/region`으로 이동해 두 위젯이 공유 (기존 위젯 간 직접 import 위반 해소)

전수 검증: 타입체크(`pnpm tsc --noEmit`) 통과, 프리뷰에서 캐러셀→지역 상세 진입(파티 슬롯 그리드 배치·최신일자 매칭·zzz 빈 슬롯), 뒤로가기, formatRegionName 라벨(양양/강릉/평창 등) 확인 완료. 폴리곤 클릭·스크롤 줌 자동 진입은 헤드리스 환경에서 Google 지도 네이티브 제스처 이벤트 합성이 안 돼 수동 wheel 이벤트로는 재현 불가 — 로직은 MapLibre 원본과 1:1 대응이라 코드 리뷰로 검증, 실브라우저 수동 QA 권장.

### ⚠️ 수용된 플랫폼 제약 (해결 불가/보류)

| 항목              | 내용                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| 카메라 애니메이션 | `panTo`/`fitBounds`에 duration·easing 없음 → 즉시 이동. MapLibre의 350~600ms flyTo 느낌 재현 불가 |
| 배경 타일 스타일  | MapTiler 파스텔 스타일 재현 불가. Cloud Console에서 Map ID 스타일링으로 근사하는 것이 한계        |
| move 스트림       | 연속 move 이벤트 없음 → 자동 선택/뷰포트 갱신이 idle(제스처 종료) 시점                            |
| 한국 규제         | 2026-02 조건부 승인, 정식 개시일 미정. 고정밀 타일 품질은 개시 후 재평가                          |
| 비용              | Maps JS API 월 10,000 로드 무료, 초과 시 유료. 키에 HTTP referrer 제한 + 예산 알림 권장           |

---

## 5. 검증 체크리스트 (이식 작업 후 수동 확인)

`.env` 키 세팅 → `pnpm dev` → 로그인 → `/map-google`:

1. 초기 뷰: 전국 + 사진 핀(지역당 1개·60px·짧은 지역명 칩) + 하단 캐러셀
2. 줌인 7.5+: 경계선 + "+" 버튼 (상위 30 지역만) / 8.5+: 전 지역 "+"
3. "+" 클릭 → 등록 플로우: 잠금·fitBounds·지역명(text-h2)·스와치 탭 즉시 색 미리보기(채움+강조선)
4. 플로우 완주(색→날짜→사진→확인) → 색칠 반영 + 지역 상세 자동 복귀 + 완료 토스트
5. 가본 지역 폴리곤/사진 핀 클릭 → 지역 상세 (파티 슬롯 피그마 배치, 내 슬롯 우하단)
6. 안 가본 지역 폴리곤 클릭(줌 7.5+) → 등록 플로우 / 초기 줌에선 무반응
7. 스크롤 줌 최대 → 가본 지역 위면 자동 상세, 안 가본 지역 위면 "+" 유지
8. 내 빈 슬롯 업로드 → 날짜 선택 없이 최신 일자 합류 + 토스트
9. 뒤로가기 → 초기 뷰 복귀, 줌아웃 → 선택 해제
10. 새로고침(직접 URL) → 정상 로드 (auth hydration 가드)

> 헤드리스 프리뷰로 검증 시: 백그라운드 탭이면 rAF 스로틀로 리페인트·idle이 지연된다.
> `google.maps.event.trigger(map, 'idle'|'resize')` 수동 트리거로 우회 가능.

---

## 6. 이식 판단 참고 (스파이크 결론용 메모)

- 기능 이식 자체는 **전부 가능** — 위 gap은 정책 후행일 뿐 플랫폼 한계가 아님
- 실질 리스크는 §4 수용된 제약 5건: 특히 **카메라 애니메이션 부재**와 **배경 스타일**이
  체감 품질 차이의 대부분
- 원본과 이식본의 중복(마커 JSX·파생 메모)이 커서, 전환을 확정하면 마커/파생 로직을
  지도-무관 훅으로 추출해 한 벌로 합치는 리팩터링 권장 (스파이크 단계에선 복제 유지)
