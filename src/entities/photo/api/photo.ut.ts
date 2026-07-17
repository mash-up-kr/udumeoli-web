import type { Photo } from "../model/types"
import utGeojeSrc from "@/shared/assets/ut-거제.jpg"
import utGeoje2Src from "@/shared/assets/ut-거제-2.jpg"
import utGeoje3Src from "@/shared/assets/ut-거제-3.jpg"
import utGyeongjuSrc from "@/shared/assets/ut-경주.jpg"
import utGyeongju2Src from "@/shared/assets/ut-경주-2.jpg"
import utGyeongju3Src from "@/shared/assets/ut-경주-3.jpg"
import utDaejeonSrc from "@/shared/assets/ut-대전.jpg"
import utDaejeon2Src from "@/shared/assets/ut-대전-2.jpg"
import utDaejeon3Src from "@/shared/assets/ut-대전-3.jpg"
import utBusanSrc from "@/shared/assets/ut-부산.jpg"
import utBusan2Src from "@/shared/assets/ut-부산-2.jpg"
import utBusan3Src from "@/shared/assets/ut-부산-3.jpg"
import utSeoulSrc from "@/shared/assets/ut-서울.jpg"
import utSeoul2Src from "@/shared/assets/ut-서울-2.jpg"
import utSeoul3Src from "@/shared/assets/ut-서울-3.jpg"
import utYangyangSrc from "@/shared/assets/ut-양양.jpg"
import utYangyang2Src from "@/shared/assets/ut-양양-2.jpg"
import utYangyang3Src from "@/shared/assets/ut-양양-3.jpg"
import utPohangSrc from "@/shared/assets/ut-포항.jpg"
import utPohang2Src from "@/shared/assets/ut-포항-2.jpg"
import utPohang3Src from "@/shared/assets/ut-포항-3.jpg"

// 1차 UT 시드용 사진 데이터 — 지역명은 TopoJSON 명칭(광역시는 provinces, 시군은
// municipalities)과 일치해야 지도에 반영된다.
// 지역당 일자 3개 → 지역 카드에 "3days"로 노출. 세 팟 모두 동일한 지역·사진으로
// 시드하며, 업로더 id는 pot.mock UT_POTS 멤버와 일치해야 갤러리 슬롯에 매칭된다.
// thumbnailUrl은 지도 핀·지역 카드에 쓰이는 대표 사진, altUrls는 다른 멤버들의
// 업로드 사진(같은 지역의 다른 여행 사진)이다.
type UtRegionSeed = {
  region: string
  lat: number
  lng: number
  thumbnailUrl: string
  altUrls: [string, string]
  dates: [string, string, string]
}

const UT_REGIONS: Array<UtRegionSeed> = [
  {
    region: "서울특별시",
    lat: 37.5665,
    lng: 126.978,
    thumbnailUrl: utSeoulSrc,
    altUrls: [utSeoul2Src, utSeoul3Src],
    dates: ["2026-06-05", "2026-06-06", "2026-06-07"],
  },
  {
    region: "양양군",
    lat: 38.074,
    lng: 128.622,
    thumbnailUrl: utYangyangSrc,
    altUrls: [utYangyang2Src, utYangyang3Src],
    dates: ["2026-07-03", "2026-07-04", "2026-07-05"],
  },
  {
    region: "대전광역시",
    lat: 36.3504,
    lng: 127.3845,
    thumbnailUrl: utDaejeonSrc,
    altUrls: [utDaejeon2Src, utDaejeon3Src],
    dates: ["2026-06-19", "2026-06-20", "2026-06-21"],
  },
  {
    region: "포항시",
    lat: 36.019,
    lng: 129.3435,
    thumbnailUrl: utPohangSrc,
    altUrls: [utPohang2Src, utPohang3Src],
    dates: ["2026-05-15", "2026-05-16", "2026-05-17"],
  },
  {
    region: "경주시",
    lat: 35.8562,
    lng: 129.2247,
    thumbnailUrl: utGyeongjuSrc,
    altUrls: [utGyeongju2Src, utGyeongju3Src],
    dates: ["2026-04-17", "2026-04-18", "2026-04-19"],
  },
  {
    region: "부산광역시",
    lat: 35.1796,
    lng: 129.0756,
    thumbnailUrl: utBusanSrc,
    altUrls: [utBusan2Src, utBusan3Src],
    dates: ["2026-06-27", "2026-06-28", "2026-06-29"],
  },
  {
    region: "거제시",
    lat: 34.8806,
    lng: 128.6211,
    thumbnailUrl: utGeojeSrc,
    altUrls: [utGeoje2Src, utGeoje3Src],
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
// → 어느 지역이든 내가 마지막으로 업로드하는 시나리오(완료 애니메이션)를 테스트할 수 있다.
// 최근 일자의 첫 장(others[0])만 대표 사진을 써 지도 핀·지역 카드 썸네일을 유지하고,
// 나머지 멤버 사진은 같은 지역의 다른 여행 사진(altUrls)으로 채워 중복돼 보이지 않게 한다
export const UT_PHOTOS: Array<Photo> = Object.entries(UT_POT_OTHERS).flatMap(
  ([potId, others]) =>
    UT_REGIONS.flatMap((r, ri) => {
      const [first, second, latest] = r.dates
      const [alt1, alt2] = r.altUrls
      const uploads = [
        { date: first, uploaderId: "user-1", url: alt2 },
        { date: second, uploaderId: others[ri % others.length], url: alt1 },
        { date: latest, uploaderId: others[0], url: r.thumbnailUrl },
        { date: latest, uploaderId: others[1], url: alt1 },
        { date: latest, uploaderId: others[2], url: alt2 },
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
        thumbnailUrl: u.url,
      }))
    })
)
