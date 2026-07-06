import type { Photo } from "../model/types"

// 러프 단계 목 데이터 — 지역명은 municipalities TopoJSON 군(郡) 명칭과 일치해야 함
export const MOCK_PHOTOS: Array<Photo> = [
  // 양양군 — 4장 (zoom 2x 정책 테스트용)
  {
    id: "p1",
    region: "양양군",
    lat: 38.074,
    lng: 128.622,
    date: "2026-05-20",
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
    date: "2026-05-22",
    uploaderId: "user-3",
    thumbnailUrl: "https://picsum.photos/seed/photato-3/200/200",
  },
  {
    id: "p4",
    region: "양양군",
    lat: 38.09,
    lng: 128.655,
    date: "2026-05-23",
    uploaderId: "user-4",
    thumbnailUrl: "https://picsum.photos/seed/photato-4/200/200",
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
