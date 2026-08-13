// 한국 행정구역 TopoJSON 전처리 — 외부 CDN(raw.githubusercontent) 원본을 받아
// 런타임에 하던 단순화를 미리 돌려 `public/korea-topo.json` 하나로 굽는다.
//
// 실행: pnpm geo:build (원본이 갱신될 때만 다시 돌리면 된다. 산출물은 커밋한다)
//
// GeoJSON이 아니라 TopoJSON으로 굽는 이유: 공유 경계(arc)를 펴면 파일이 몇 배로
// 커진다. 토폴로지는 유지하고, 무거운 presimplify/simplify만 빌드타임으로 옮긴다.
import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { bbox, quantize } from "topojson-client"
import { presimplify, quantile, simplify } from "topojson-simplify"

const SOURCES = {
  municipalities:
    "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-municipalities-2018-topo-simple.json",
  provinces:
    "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-provinces-2018-topo-simple.json",
}

// 원본(-simple)도 시군구 전체 ~5.5만 정점이라 지도가 매 프레임 다시 그리기엔 과하다.
// 공유 경계 단위로 절반 수준까지 추가 단순화 — 모바일 최대 줌(9.5)에선 시각 차이가 거의 없다.
const SIMPLIFY_RETAIN = 0.5

function countPoints(topo) {
  return topo.arcs.reduce((sum, arc) => sum + arc.length, 0)
}

// 원본과 동일한 좌표 정밀도 — bbox(경도 약 7도) 기준 격자 하나가 7e-5도(약 7m)라
// 모바일 최대 줌(9.5)에서 눈에 띄지 않는다. 재양자화를 안 하면 simplify가 정수 델타
// 인코딩을 풀어버려 정점을 절반으로 줄이고도 파일이 2배로 커진다.
const QUANTIZATION = 1e5

async function loadSimplified(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`)
  const topo = await res.json()
  const pre = presimplify(topo)
  const simplified = simplify(pre, quantile(pre, SIMPLIFY_RETAIN))
  // presimplify가 각 정점에 심어둔 z(3번째 좌표) 제거 — 남으면 quantize가 그대로 흘려보낸다
  simplified.arcs = simplified.arcs.map((arc) => arc.map(([x, y]) => [x, y]))
  simplified.bbox ??= bbox(simplified)
  return { topo: quantize(simplified, QUANTIZATION), before: topo }
}

const out = {}
for (const [key, url] of Object.entries(SOURCES)) {
  const { topo, before } = await loadSimplified(url)
  out[key] = topo
  console.log(
    `${key}: 정점 ${countPoints(before)} → ${countPoints(topo)} (arc ${topo.arcs.length})`
  )
}

const target = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "korea-topo.json"
)
writeFileSync(target, JSON.stringify(out))
console.log(`→ ${target} (${Math.round(JSON.stringify(out).length / 1024)} KB)`)
