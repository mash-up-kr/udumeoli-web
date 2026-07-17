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
// 지역당 일자 3개 → 지역 카드에 "3days"로 노출. 세 팟 모두 동일한 지역·사진으로
// 시드하며, 업로더 id는 pot.mock UT_POTS 멤버와 일치해야 갤러리 슬롯에 매칭된다.
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

// 팟별 "나(user-1) 외" 멤버 id — pot.mock UT_POTS의 멤버 구성과 일치해야 함
const UT_POT_OTHERS: Record<string, Array<string>> = {
  "pot-ut-1": ["m-축구왕 준표-0", "m-존잘 창우-1", "m-사진작가 정우-2"],
  "pot-ut-2": ["m-권예인-0", "m-김나희-1", "m-이원영-2"],
  "pot-ut-3": ["m-김수연-0", "m-장서휘-1", "m-전계원-2"],
}

// 지역당 5장: 앞선 두 일자는 나·멤버 1명, 가장 최근 일자는 나를 제외한 전원 업로드
// → 어느 지역이든 내가 마지막으로 업로드하는 시나리오(완료 애니메이션)를 테스트할 수 있다
export const UT_PHOTOS: Array<Photo> = Object.entries(UT_POT_OTHERS).flatMap(
  ([potId, others]) =>
    UT_REGIONS.flatMap((r, ri) => {
      const [first, second, latest] = r.dates
      const uploads = [
        { date: first, uploaderId: "user-1" },
        { date: second, uploaderId: others[ri % others.length] },
        ...others.map((uploaderId) => ({ date: latest, uploaderId })),
      ]
      return uploads.map((u, i) => ({
        id: `ut-${potId}-${r.region}-${i}`,
        potId,
        region: r.region,
        // 같은 지역 내 사진끼리 핀이 겹치지 않게 살짝 오프셋
        lat: r.lat + i * 0.006,
        lng: r.lng + i * 0.006,
        date: u.date,
        uploaderId: u.uploaderId,
        thumbnailUrl: r.thumbnailUrl,
      }))
    })
)
