import type { Photo } from "../model/types"
import utGeojeSrc from "@/shared/assets/ut-거제.jpg"
import utGyeongjuSrc from "@/shared/assets/ut-경주.jpg"
import utDaejeonSrc from "@/shared/assets/ut-대전.jpg"
import utBusanSrc from "@/shared/assets/ut-부산.jpg"
import utSeoulSrc from "@/shared/assets/ut-서울.jpg"
import utYangyangSrc from "@/shared/assets/ut-양양.jpg"
import utPohangSrc from "@/shared/assets/ut-포항.jpg"

// 1차 UT 시드용 사진 데이터 — 지역명은 TopoJSON 명칭(광역시는 provinces, 시군은
// municipalities)과 일치해야 지도에 반영된다.
// 지역당 일자 3개 → 지역 카드에 "3days"로 노출. 업로더는 UT 팟(pot-ut) 멤버
// (나 user-1, 유지 m-유지-0)와 일치해야 갤러리 슬롯에 매칭된다.
type UtRegionSeed = {
  region: string
  lat: number
  lng: number
  thumbnailUrl: string
  dates: [string, string, string]
}

const UT_REGIONS: Array<UtRegionSeed> = [
  {
    region: "서울특별시",
    lat: 37.5665,
    lng: 126.978,
    thumbnailUrl: utSeoulSrc,
    dates: ["2026-06-05", "2026-06-06", "2026-06-07"],
  },
  {
    region: "양양군",
    lat: 38.074,
    lng: 128.622,
    thumbnailUrl: utYangyangSrc,
    dates: ["2026-07-03", "2026-07-04", "2026-07-05"],
  },
  {
    region: "대전광역시",
    lat: 36.3504,
    lng: 127.3845,
    thumbnailUrl: utDaejeonSrc,
    dates: ["2026-06-19", "2026-06-20", "2026-06-21"],
  },
  {
    region: "포항시",
    lat: 36.019,
    lng: 129.3435,
    thumbnailUrl: utPohangSrc,
    dates: ["2026-05-15", "2026-05-16", "2026-05-17"],
  },
  {
    region: "경주시",
    lat: 35.8562,
    lng: 129.2247,
    thumbnailUrl: utGyeongjuSrc,
    dates: ["2026-04-17", "2026-04-18", "2026-04-19"],
  },
  {
    region: "부산광역시",
    lat: 35.1796,
    lng: 129.0756,
    thumbnailUrl: utBusanSrc,
    dates: ["2026-06-27", "2026-06-28", "2026-06-29"],
  },
  {
    region: "거제시",
    lat: 34.8806,
    lng: 128.6211,
    thumbnailUrl: utGeojeSrc,
    dates: ["2026-05-29", "2026-05-30", "2026-05-31"],
  },
]

export const UT_PHOTOS: Array<Photo> = UT_REGIONS.flatMap((r) =>
  r.dates.map((date, di) => ({
    id: `ut-${r.region}-${di}`,
    potId: "pot-ut",
    region: r.region,
    // 같은 지역 내 사진끼리 핀이 겹치지 않게 살짝 오프셋
    lat: r.lat + di * 0.008,
    lng: r.lng + di * 0.008,
    date,
    uploaderId: di % 2 === 0 ? "user-1" : "m-유지-0",
    thumbnailUrl: r.thumbnailUrl,
  }))
)
