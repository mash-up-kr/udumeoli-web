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

// 여행 앨범 시드 — [날짜, 업로더(멤버 인덱스), 코멘트?] 튜플로 지역별 방문 기록을 정의.
// 연속된 날짜가 방문 1회로 묶이므로(groupTrips) 창원 5회 / 대전 4회 / 강릉 2회가 된다.
// 인덱스 0(나)이 창원·강릉의 최신 방문에 빠져 있어 카드 Alert와 '기록하기' CTA를 확인할 수 있다.
type AlbumSeed = {
  region: string
  uploads: Array<[date: string, memberIdx: number, comment?: string]>
}

const ALBUM_SEEDS: Array<AlbumSeed> = [
  {
    region: "창원시",
    uploads: [
      ["2026-07-20", 1, "야르하게찍었쥬?ㅋㅋㅋㅋ"],
      ["2026-07-21", 1],
      ["2026-07-21", 2, "여기 다음에 또 오자"],
      ["2026-05-02", 0, "벚꽃 만개!"],
      ["2026-05-03", 1],
      ["2026-05-03", 2],
      ["2026-03-14", 0],
      ["2025-11-21", 1, "겨울 바다도 좋네"],
      ["2025-08-01", 0, "휴가 1일차"],
      ["2025-08-02", 2],
    ],
  },
  {
    region: "대전광역시",
    uploads: [
      ["2026-06-19", 0, "성심당은 못 참지"],
      ["2026-06-20", 1],
      ["2026-04-10", 0],
      ["2025-12-24", 0, "크리스마스 이브"],
      ["2025-12-25", 2],
      ["2025-09-05", 0],
    ],
  },
  {
    region: "강릉시",
    uploads: [
      ["2026-02-27", 1, "혼자 다녀옴 ㅎㅎ"],
      ["2026-02-28", 1],
      ["2025-07-18", 0, "바다!!"],
      ["2025-07-19", 1],
    ],
  },
]

// pot.mock의 지도용 좌표 컨벤션과 동일하게 지역 대표 좌표 부근으로 시드
const ALBUM_REGION_CENTERS: Record<string, { lat: number; lng: number }> = {
  창원시: { lat: 35.228, lng: 128.681 },
  대전광역시: { lat: 36.3504, lng: 127.3845 },
  강릉시: { lat: 37.752, lng: 128.876 },
}

/**
 * 여행 앨범 목 사진 생성 — 현재 팟 기준으로 창원/대전/강릉 방문 기록을 만든다.
 * memberIds는 팟 멤버 id 순서(0번째 = 나)이며, 인원이 적으면 순환해 채운다.
 */
export function makeAlbumPhotos(
  potId: string,
  memberIds: Array<string>
): Array<Photo> {
  if (memberIds.length === 0) return []
  return ALBUM_SEEDS.flatMap((seed) => {
    const center = ALBUM_REGION_CENTERS[seed.region]
    return seed.uploads.map(([date, memberIdx, comment], i) => ({
      id: `album-${potId}-${seed.region}-${i}`,
      potId,
      region: seed.region,
      lat: center.lat + i * 0.004,
      lng: center.lng + i * 0.004,
      date,
      uploaderId: memberIds[memberIdx % memberIds.length],
      thumbnailUrl: `https://picsum.photos/seed/album-${seed.region}-${i}/400/400`,
      comment,
    }))
  })
}

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
