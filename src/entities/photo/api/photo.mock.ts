import type { Photo } from "../model/types"

// 러프 단계 목 데이터 — 지역명은 municipalities TopoJSON 명칭과 일치해야 함.
// uploaderId는 pot.mock의 멤버 id(나 user-1, 그 외 m-<닉네임>-<i>)와 일치해야 슬롯에 매칭된다.
const BASE_PHOTOS: Array<Omit<Photo, "potId">> = [
  // 강릉시 — 나(user-1)만 미업로드, 나머지 전원 업로드 완료.
  // N명 팟 어디서든 마지막(내) 업로드 시 완료 애니메이션 확인용
  {
    id: "p13",
    region: "강릉시",
    lat: 37.752,
    lng: 128.876,
    date: "2026-05-12",
    uploaderId: "m-유지-0",
    thumbnailUrl: "https://picsum.photos/seed/photato-13/200/200",
  },
  {
    id: "p14",
    region: "강릉시",
    lat: 37.76,
    lng: 128.89,
    date: "2026-05-12",
    uploaderId: "m-성아-1",
    thumbnailUrl: "https://picsum.photos/seed/photato-14/200/200",
  },
  {
    id: "p15",
    region: "강릉시",
    lat: 37.745,
    lng: 128.862,
    date: "2026-05-12",
    uploaderId: "m-가연-2",
    thumbnailUrl: "https://picsum.photos/seed/photato-15/200/200",
  },
  {
    id: "p16",
    region: "강릉시",
    lat: 37.767,
    lng: 128.905,
    date: "2026-05-12",
    uploaderId: "m-수빈-3",
    thumbnailUrl: "https://picsum.photos/seed/photato-16/200/200",
  },
  {
    id: "p17",
    region: "강릉시",
    lat: 37.738,
    lng: 128.847,
    date: "2026-05-12",
    uploaderId: "m-민지-4",
    thumbnailUrl: "https://picsum.photos/seed/photato-17/200/200",
  },
  // 강릉시 추가 여행 일자 (총 3개) — 최신 일자는 05-12("나만 미업로드" 시나리오) 유지
  {
    id: "p18",
    region: "강릉시",
    lat: 37.755,
    lng: 128.88,
    date: "2026-05-01",
    uploaderId: "user-1",
    thumbnailUrl: "https://picsum.photos/seed/photato-18/200/200",
  },
  {
    id: "p19",
    region: "강릉시",
    lat: 37.748,
    lng: 128.869,
    date: "2026-05-01",
    uploaderId: "m-유지-0",
    thumbnailUrl: "https://picsum.photos/seed/photato-19/200/200",
  },
  {
    id: "p20",
    region: "강릉시",
    lat: 37.762,
    lng: 128.893,
    date: "2025-12-30",
    uploaderId: "user-1",
    thumbnailUrl: "https://picsum.photos/seed/photato-20/200/200",
  },

  // 양양군 — 갤러리 예시: 2026-05-21 전원(4명 팟 기준) 업로드 완료(파란 tint),
  // 2026-05-20 나(user-1)만 미업로드 → 업로드 시 파란 tint 전환 확인용
  {
    id: "p1",
    region: "양양군",
    lat: 38.074,
    lng: 128.622,
    date: "2026-05-21",
    uploaderId: "user-1",
    thumbnailUrl: "https://picsum.photos/seed/photato-1/200/200",
  },
  {
    id: "p2",
    region: "양양군",
    lat: 38.082,
    lng: 128.641,
    date: "2026-05-21",
    uploaderId: "m-유지-0",
    thumbnailUrl: "https://picsum.photos/seed/photato-2/200/200",
  },
  {
    id: "p3",
    region: "양양군",
    lat: 38.063,
    lng: 128.609,
    date: "2026-05-21",
    uploaderId: "m-성아-1",
    thumbnailUrl: "https://picsum.photos/seed/photato-3/200/200",
  },
  {
    id: "p4",
    region: "양양군",
    lat: 38.09,
    lng: 128.655,
    date: "2026-05-21",
    uploaderId: "m-가연-2",
    thumbnailUrl: "https://picsum.photos/seed/photato-4/200/200",
  },
  {
    id: "p10",
    region: "양양군",
    lat: 38.071,
    lng: 128.631,
    date: "2026-05-20",
    uploaderId: "m-유지-0",
    thumbnailUrl: "https://picsum.photos/seed/photato-10/200/200",
  },
  {
    id: "p11",
    region: "양양군",
    lat: 38.086,
    lng: 128.618,
    date: "2026-05-20",
    uploaderId: "m-성아-1",
    thumbnailUrl: "https://picsum.photos/seed/photato-11/200/200",
  },
  {
    id: "p12",
    region: "양양군",
    lat: 38.078,
    lng: 128.648,
    date: "2026-05-20",
    uploaderId: "m-가연-2",
    thumbnailUrl: "https://picsum.photos/seed/photato-12/200/200",
  },
  // 양양군 추가 여행 일자 (총 5개)
  {
    id: "p21",
    region: "양양군",
    lat: 38.068,
    lng: 128.615,
    date: "2026-05-19",
    uploaderId: "user-1",
    thumbnailUrl: "https://picsum.photos/seed/photato-21/200/200",
  },
  {
    id: "p22",
    region: "양양군",
    lat: 38.085,
    lng: 128.637,
    date: "2026-05-19",
    uploaderId: "m-성아-1",
    thumbnailUrl: "https://picsum.photos/seed/photato-22/200/200",
  },
  {
    id: "p23",
    region: "양양군",
    lat: 38.076,
    lng: 128.652,
    date: "2025-11-08",
    uploaderId: "m-유지-0",
    thumbnailUrl: "https://picsum.photos/seed/photato-23/200/200",
  },
  {
    id: "p24",
    region: "양양군",
    lat: 38.066,
    lng: 128.626,
    date: "2025-08-15",
    uploaderId: "user-1",
    thumbnailUrl: "https://picsum.photos/seed/photato-24/200/200",
  },
  {
    id: "p25",
    region: "양양군",
    lat: 38.088,
    lng: 128.644,
    date: "2025-08-15",
    uploaderId: "m-가연-2",
    thumbnailUrl: "https://picsum.photos/seed/photato-25/200/200",
  },
  {
    id: "p26",
    region: "양양군",
    lat: 38.072,
    lng: 128.658,
    date: "2025-08-15",
    uploaderId: "m-수빈-3",
    thumbnailUrl: "https://picsum.photos/seed/photato-26/200/200",
  },

  // 고성군 — 여행 일자 4개
  {
    id: "p5",
    region: "고성군",
    lat: 38.38,
    lng: 128.467,
    date: "2026-04-10",
    uploaderId: "user-1",
    thumbnailUrl: "https://picsum.photos/seed/photato-5/200/200",
  },
  {
    id: "p6",
    region: "고성군",
    lat: 38.395,
    lng: 128.48,
    date: "2026-04-11",
    uploaderId: "m-유지-0",
    thumbnailUrl: "https://picsum.photos/seed/photato-6/200/200",
  },
  {
    id: "p31",
    region: "고성군",
    lat: 38.388,
    lng: 128.472,
    date: "2026-04-12",
    uploaderId: "user-1",
    thumbnailUrl: "https://picsum.photos/seed/photato-31/200/200",
  },
  {
    id: "p32",
    region: "고성군",
    lat: 38.399,
    lng: 128.486,
    date: "2026-04-12",
    uploaderId: "m-유지-0",
    thumbnailUrl: "https://picsum.photos/seed/photato-32/200/200",
  },
  {
    id: "p33",
    region: "고성군",
    lat: 38.374,
    lng: 128.459,
    date: "2025-12-25",
    uploaderId: "user-1",
    thumbnailUrl: "https://picsum.photos/seed/photato-33/200/200",
  },

  // 해남군 — 여행 일자 4개
  {
    id: "p7",
    region: "해남군",
    lat: 34.571,
    lng: 126.599,
    date: "2026-03-15",
    uploaderId: "m-성아-1",
    thumbnailUrl: "https://picsum.photos/seed/photato-7/200/200",
  },
  {
    id: "p8",
    region: "해남군",
    lat: 34.558,
    lng: 126.612,
    date: "2026-03-16",
    uploaderId: "user-1",
    thumbnailUrl: "https://picsum.photos/seed/photato-8/200/200",
  },
  {
    id: "p27",
    region: "해남군",
    lat: 34.565,
    lng: 126.605,
    date: "2026-03-17",
    uploaderId: "user-1",
    thumbnailUrl: "https://picsum.photos/seed/photato-27/200/200",
  },
  {
    id: "p28",
    region: "해남군",
    lat: 34.575,
    lng: 126.618,
    date: "2026-03-17",
    uploaderId: "m-유지-0",
    thumbnailUrl: "https://picsum.photos/seed/photato-28/200/200",
  },
  {
    id: "p29",
    region: "해남군",
    lat: 34.552,
    lng: 126.594,
    date: "2025-10-03",
    uploaderId: "m-가연-2",
    thumbnailUrl: "https://picsum.photos/seed/photato-29/200/200",
  },
  {
    id: "p30",
    region: "해남군",
    lat: 34.561,
    lng: 126.588,
    date: "2025-10-03",
    uploaderId: "m-유지-0",
    thumbnailUrl: "https://picsum.photos/seed/photato-30/200/200",
  },

  // 평창군 — 여행 일자 2개
  {
    id: "p9",
    region: "평창군",
    lat: 37.37,
    lng: 128.39,
    date: "2026-02-10",
    uploaderId: "m-유지-0",
    thumbnailUrl: "https://picsum.photos/seed/photato-9/200/200",
  },
  {
    id: "p34",
    region: "평창군",
    lat: 37.377,
    lng: 128.402,
    date: "2026-02-11",
    uploaderId: "user-1",
    thumbnailUrl: "https://picsum.photos/seed/photato-34/200/200",
  },
  {
    id: "p35",
    region: "평창군",
    lat: 37.364,
    lng: 128.381,
    date: "2026-02-11",
    uploaderId: "m-유지-0",
    thumbnailUrl: "https://picsum.photos/seed/photato-35/200/200",
  },
]

// pot.mock의 OTHERS[i]("m-<닉네임>-<i>")는 (i+2)명 팟부터 멤버, user-1(나)은 전 팟 멤버
function isMemberOfPot(uploaderId: string, potSize: number): boolean {
  if (uploaderId === "user-1") return true
  const idx = Number(uploaderId.split("-").at(-1))
  return Number.isInteger(idx) && idx + 2 <= potSize
}

// 여행 앨범 목데이터 전용 팟 id — pot.mock ALBUM_POT과 일치해야 한다 (photo.ut의
// "pot-ut-1" 하드코딩과 같은 컨벤션). 이 팟의 멤버는 user-1 + m-유지-0/m-성아-1/m-가연-2.
export const ALBUM_POT_ID = "pot-album-1"

// 여행 앨범 시드 — [날짜, 업로더 id, 코멘트?] 튜플로 지역별 방문 기록을 정의.
// 연속된 날짜가 방문 1회로 묶인다(groupTrips). keyword는 지도 스티커·지역 색을 결정.
// 창원 최신 방문에 나(user-1)와 성아가 빠져 있어 '기록하기' CTA와 zzZ 슬롯,
// 카드 Alert, 지도 미완료(협업) 상태를 모두 확인할 수 있다.
type AlbumSeed = {
  region: string
  keyword: Photo["keyword"]
  uploads: Array<[date: string, uploaderId: string, comment?: string]>
}

const ALBUM_SEEDS: Array<AlbumSeed> = [
  {
    region: "창원시",
    keyword: "FOOD",
    uploads: [
      // 최신 방문 — 유지·가연만 업로드, 나·성아 미기록 (기록하기/zzZ 케이스)
      ["2026-07-20", "m-유지-0", "야르하게찍었쥬?ㅋㅋㅋㅋ"],
      ["2026-07-21", "m-유지-0", "빵지순례 2일차"],
      ["2026-07-21", "m-가연-2", "여기 다음에 또 오자"],
      // 전원 업로드 완료 방문 (지도 색칠·스티커 케이스)
      ["2026-05-02", "user-1", "벚꽃 만개!"],
      ["2026-05-03", "m-유지-0", "사진 미쳤다"],
      ["2026-05-03", "m-성아-1", "다음엔 회 먹으러 가자"],
      ["2026-05-03", "m-가연-2"],
      ["2026-03-14", "user-1"],
      ["2025-11-21", "m-유지-0", "겨울 바다도 좋네"],
      ["2025-08-01", "user-1", "휴가 1일차"],
      ["2025-08-02", "m-성아-1", "더워도 바다는 못 참지"],
    ],
  },
  {
    region: "대전광역시",
    keyword: "FOOD",
    uploads: [
      // 전원 업로드 완료 방문
      ["2026-06-19", "user-1", "성심당은 못 참지"],
      ["2026-06-19", "m-유지-0", "튀소 4박스 클리어"],
      ["2026-06-20", "m-성아-1", "빵 냄새로 배부름"],
      ["2026-06-20", "m-가연-2", "다음엔 보문산도 가자"],
      ["2026-04-10", "user-1"],
      ["2025-12-24", "user-1", "크리스마스 이브"],
      ["2025-12-25", "m-가연-2", "겨울 대전 감성"],
    ],
  },
  {
    region: "강릉시",
    keyword: "NATURE",
    uploads: [
      ["2026-02-27", "m-유지-0", "혼자 다녀옴 ㅎㅎ"],
      ["2026-02-28", "m-유지-0"],
      // 전원 업로드 완료 방문
      ["2025-07-18", "user-1", "바다!!"],
      ["2025-07-18", "m-유지-0"],
      ["2025-07-19", "m-성아-1", "서핑 재밌다"],
      ["2025-07-19", "m-가연-2", "일출 대박"],
    ],
  },
]

// pot.mock의 지도용 좌표 컨벤션과 동일하게 지역 대표 좌표 부근으로 시드
const ALBUM_REGION_CENTERS: Record<string, { lat: number; lng: number }> = {
  창원시: { lat: 35.228, lng: 128.681 },
  대전광역시: { lat: 36.3504, lng: 127.3845 },
  강릉시: { lat: 37.752, lng: 128.876 },
}

// ── 스티커 100개 데모 시드 ──────────────────────────────────────────────
// 전국 100개 시군구에 전원 업로드 완료 여행 1개씩 시드 — 지도에서 지역 색칠과
// 키워드 스티커가 전 지역에 골고루 깔린 모습을 확인하는 용도.
// 지역명은 municipalities TopoJSON 명칭과 일치해야 스티커가 centroid에 붙는다.
// (ALBUM_SEEDS의 창원시·대전광역시·강릉시, 이름이 중복되는 고성군은 제외)
// 데모가 끝나면 이 블록과 photo.api의 STICKER_DEMO_PHOTOS 스프레드만 지우면 된다.

// 지도 디버그 데모 팟 — pot.mock TRIP_100_POT(여행 100번)과 일치해야 한다
export const TRIP_100_POT_ID = "pot-trip-100-1"

// TRIP_100_POT 멤버 전원 — 5명 모두 업로드해야 여행이 완료(색칠) 상태가 된다
const STICKER_DEMO_UPLOADERS = [
  "user-1",
  "m-유지-0",
  "m-성아-1",
  "m-가연-2",
  "m-수빈-3",
]

const STICKER_DEMO_KEYWORDS: Array<NonNullable<Photo["keyword"]>> = [
  "FOOD",
  "HEALING",
  "CITY",
  "ACTIVITY",
  "NATURE",
]

// 좌표는 권역별 러프 중심 + 순번 오프셋 — 스티커 위치는 GeoJSON centroid를 쓰므로 폴백용
const STICKER_DEMO_GROUPS: Array<{
  lat: number
  lng: number
  regions: Array<string>
}> = [
  {
    // 수도권
    lat: 37.45,
    lng: 127.0,
    regions: [
      "서울특별시",
      "인천광역시",
      "수원시",
      "성남시",
      "고양시",
      "용인시",
      "부천시",
      "안산시",
      "안양시",
      "남양주시",
      "평택시",
      "파주시",
      "김포시",
      "이천시",
      "양평군",
      "가평군",
    ],
  },
  {
    // 강원
    lat: 37.8,
    lng: 128.2,
    regions: [
      "춘천시",
      "원주시",
      "동해시",
      "속초시",
      "삼척시",
      "홍천군",
      "영월군",
      "평창군",
      "정선군",
      "철원군",
      "인제군",
    ],
  },
  {
    // 충북
    lat: 36.8,
    lng: 127.7,
    regions: [
      "청주시",
      "충주시",
      "제천시",
      "보은군",
      "옥천군",
      "영동군",
      "진천군",
      "단양군",
    ],
  },
  {
    // 충남·세종
    lat: 36.5,
    lng: 126.9,
    regions: [
      "세종특별자치시",
      "천안시",
      "공주시",
      "보령시",
      "아산시",
      "서산시",
      "논산시",
      "당진시",
      "부여군",
      "홍성군",
      "태안군",
    ],
  },
  {
    // 전북
    lat: 35.75,
    lng: 127.05,
    regions: [
      "전주시",
      "군산시",
      "익산시",
      "정읍시",
      "남원시",
      "김제시",
      "완주군",
      "무주군",
      "고창군",
      "부안군",
    ],
  },
  {
    // 전남·광주
    lat: 34.9,
    lng: 126.8,
    regions: [
      "광주광역시",
      "목포시",
      "여수시",
      "순천시",
      "나주시",
      "광양시",
      "담양군",
      "고흥군",
      "보성군",
      "강진군",
      "영광군",
      "완도군",
      "진도군",
      "신안군",
    ],
  },
  {
    // 경북·대구
    lat: 36.3,
    lng: 128.7,
    regions: [
      "대구광역시",
      "포항시",
      "경주시",
      "김천시",
      "안동시",
      "구미시",
      "영주시",
      "영천시",
      "상주시",
      "문경시",
      "경산시",
      "청송군",
      "울진군",
      "울릉군",
    ],
  },
  {
    // 경남·부산·울산
    lat: 35.3,
    lng: 128.3,
    regions: [
      "부산광역시",
      "울산광역시",
      "진주시",
      "통영시",
      "사천시",
      "김해시",
      "밀양시",
      "거제시",
      "양산시",
      "창녕군",
      "남해군",
      "하동군",
      "거창군",
      "합천군",
    ],
  },
  {
    // 제주
    lat: 33.4,
    lng: 126.55,
    regions: ["제주시", "서귀포시"],
  },
]

const STICKER_DEMO_REGIONS = STICKER_DEMO_GROUPS.flatMap((group) =>
  group.regions.map((region, i) => ({
    region,
    lat: group.lat + (i % 5) * 0.02,
    lng: group.lng + (i % 7) * 0.02,
  }))
)

// 2025년 안에서 지역별로 결정적 날짜 — ALBUM_SEEDS의 2026년 최신 여행
// (창원 기록하기 케이스 등)보다 과거라 기존 시나리오 순서를 건드리지 않는다
function stickerDemoDate(i: number): string {
  const month = String((i % 12) + 1).padStart(2, "0")
  const day = String((Math.floor(i / 12) % 28) + 1).padStart(2, "0")
  return `2025-${month}-${day}`
}

export const STICKER_DEMO_PHOTOS: Array<Photo> = STICKER_DEMO_REGIONS.flatMap(
  ({ region, lat, lng }, i) =>
    STICKER_DEMO_UPLOADERS.map((uploaderId, u) => ({
      id: `sticker-demo-${region}-${u}`,
      potId: TRIP_100_POT_ID,
      region,
      lat: lat + u * 0.003,
      lng: lng + u * 0.003,
      date: stickerDemoDate(i),
      uploaderId,
      thumbnailUrl: `https://picsum.photos/seed/sticker-demo-${i}-${u}/400/400`,
      keyword: STICKER_DEMO_KEYWORDS[i % STICKER_DEMO_KEYWORDS.length],
    }))
)

// 여행 앨범 목 사진 — fetchPhotos(목)에 항상 포함돼 지도/앨범/지역 상세가
// 같은 목록을 본다. ALBUM_POT_ID 팟에서만 노출된다(useAllPhotos가 potId로 필터).
export const ALBUM_PHOTOS: Array<Photo> = ALBUM_SEEDS.flatMap((seed) => {
  const center = ALBUM_REGION_CENTERS[seed.region]
  return seed.uploads.map(([date, uploaderId, comment], i) => ({
    id: `album-${ALBUM_POT_ID}-${seed.region}-${i}`,
    potId: ALBUM_POT_ID,
    region: seed.region,
    lat: center.lat + i * 0.004,
    lng: center.lng + i * 0.004,
    date,
    uploaderId,
    thumbnailUrl: `https://picsum.photos/seed/album-${seed.region}-${i}/400/400`,
    ...(comment ? { comment } : {}),
    ...(seed.keyword ? { keyword: seed.keyword } : {}),
  }))
})

// 팟별로 사진을 분리 — 각 팟(pot-1~pot-6)에는 그 팟 멤버가 올린 사진만 존재.
// 썸네일 시드도 팟별로 달리해 팟마다 다른 사진처럼 보이게 한다.
export const MOCK_PHOTOS: Array<Photo> = Array.from(
  { length: 6 },
  (_, i) => `pot-${i + 1}`
).flatMap((potId, i) =>
  BASE_PHOTOS.filter((p) => isMemberOfPot(p.uploaderId, i + 1)).map((p) => ({
    ...p,
    potId,
    id: `${potId}-${p.id}`,
    thumbnailUrl: `https://picsum.photos/seed/photato-${potId}-${p.id}/200/200`,
  }))
)
