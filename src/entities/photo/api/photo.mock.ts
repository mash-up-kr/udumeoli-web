import type { Photo } from "../model/types"

// 러프 단계 목 데이터 — 지역명은 municipalities TopoJSON 군(郡) 명칭과 일치해야 함
export const MOCK_PHOTOS: Array<Photo> = [
  // 양양군 — 갤러리 예시: 2026-05-21 전원(4명) 업로드 완료(파란 tint),
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
    uploaderId: "user-2",
    thumbnailUrl: "https://picsum.photos/seed/photato-2/200/200",
  },
  {
    id: "p3",
    region: "양양군",
    lat: 38.063,
    lng: 128.609,
    date: "2026-05-21",
    uploaderId: "user-3",
    thumbnailUrl: "https://picsum.photos/seed/photato-3/200/200",
  },
  {
    id: "p4",
    region: "양양군",
    lat: 38.09,
    lng: 128.655,
    date: "2026-05-21",
    uploaderId: "user-4",
    thumbnailUrl: "https://picsum.photos/seed/photato-4/200/200",
  },
  {
    id: "p10",
    region: "양양군",
    lat: 38.071,
    lng: 128.631,
    date: "2026-05-20",
    uploaderId: "user-2",
    thumbnailUrl: "https://picsum.photos/seed/photato-10/200/200",
  },
  {
    id: "p11",
    region: "양양군",
    lat: 38.086,
    lng: 128.618,
    date: "2026-05-20",
    uploaderId: "user-3",
    thumbnailUrl: "https://picsum.photos/seed/photato-11/200/200",
  },
  {
    id: "p12",
    region: "양양군",
    lat: 38.078,
    lng: 128.648,
    date: "2026-05-20",
    uploaderId: "user-4",
    thumbnailUrl: "https://picsum.photos/seed/photato-12/200/200",
  },

  // 고성군 — 2장
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
    uploaderId: "user-2",
    thumbnailUrl: "https://picsum.photos/seed/photato-6/200/200",
  },

  // 해남군 — 2장
  {
    id: "p7",
    region: "해남군",
    lat: 34.571,
    lng: 126.599,
    date: "2026-03-15",
    uploaderId: "user-3",
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

  // 평창군 — 1장
  {
    id: "p9",
    region: "평창군",
    lat: 37.37,
    lng: 128.39,
    date: "2026-02-10",
    uploaderId: "user-2",
    thumbnailUrl: "https://picsum.photos/seed/photato-9/200/200",
  },
]
