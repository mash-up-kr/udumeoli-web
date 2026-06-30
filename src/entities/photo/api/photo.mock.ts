import type { Photo } from "../model/types"

// 러프 단계 목 데이터 — 주요 도시 좌표에 사진 핀 분포 (썸네일은 picsum placeholder)
export const MOCK_PHOTOS: Array<Photo> = [
  { id: "p1", region: "서울", lat: 37.5665, lng: 126.978, date: "2026-05-12", uploaderId: "user-1", thumbnailUrl: "https://picsum.photos/seed/photato-1/200/200" },
  { id: "p2", region: "서울", lat: 37.5796, lng: 126.977, date: "2026-05-12", uploaderId: "user-2", thumbnailUrl: "https://picsum.photos/seed/photato-2/200/200" },
  { id: "p3", region: "강릉", lat: 37.7519, lng: 128.8761, date: "2026-05-20", uploaderId: "user-1", thumbnailUrl: "https://picsum.photos/seed/photato-3/200/200" },
  { id: "p4", region: "강릉", lat: 37.77, lng: 128.9, date: "2026-05-20", uploaderId: "user-3", thumbnailUrl: "https://picsum.photos/seed/photato-4/200/200" },
  { id: "p5", region: "대전", lat: 36.3504, lng: 127.3845, date: "2026-04-10", uploaderId: "user-2", thumbnailUrl: "https://picsum.photos/seed/photato-5/200/200" },
  { id: "p6", region: "부산", lat: 35.1796, lng: 129.0756, date: "2026-03-22", uploaderId: "user-1", thumbnailUrl: "https://picsum.photos/seed/photato-6/200/200" },
  { id: "p7", region: "부산", lat: 35.16, lng: 129.16, date: "2026-03-22", uploaderId: "user-3", thumbnailUrl: "https://picsum.photos/seed/photato-7/200/200" },
  { id: "p8", region: "경주", lat: 35.8562, lng: 129.2247, date: "2026-02-15", uploaderId: "user-2", thumbnailUrl: "https://picsum.photos/seed/photato-8/200/200" },
  { id: "p9", region: "광주", lat: 35.1595, lng: 126.8526, date: "2026-01-30", uploaderId: "user-1", thumbnailUrl: "https://picsum.photos/seed/photato-9/200/200" },
  { id: "p10", region: "제주", lat: 33.4996, lng: 126.5312, date: "2026-05-01", uploaderId: "user-3", thumbnailUrl: "https://picsum.photos/seed/photato-10/200/200" },
]
