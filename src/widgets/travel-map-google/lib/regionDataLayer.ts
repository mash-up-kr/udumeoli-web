// google.maps.Data 기반 지역 폴리곤 레이어.
// MapLibre의 addSource/addLayer + setFeatureState 조합을 대체하는 스파이크 구현체.
//
// MapLibre는 feature-state를 GPU 쪽에 유지하고 data-driven expression(case/coalesce)으로
// 페인트를 계산하지만, google.maps.Data는 그런 개념이 없다. 대신 지역별 시각 상태를
// JS 메모리(Map)에 직접 들고 있다가, 상태가 바뀔 때마다 전체 스타일을 계산해
// `data.overrideStyle(feature, style)`로 통째로 덮어쓰는 방식으로 동일 효과를 낸다.

const BOUNDARY_ZOOM = 7.5

export type RegionVisualState = {
  hasColor: boolean
  color?: string
  hasPhoto: boolean
  active: boolean
  /** 첫 여행 등록 플로우 진행 중인 지역이면 강조 테두리 색 (점선 대신 굵은 실선으로 근사) */
  decorateColor?: string
}

function computeStyle(
  state: RegionVisualState,
  zoom: number,
  accent: string
): google.maps.Data.StyleOptions {
  const fillOpacity = state.active
    ? 0.15
    : state.hasColor
      ? 0.7
      : state.hasPhoto
        ? 0.08
        : 0
  const fillColor = state.hasColor && state.color ? state.color : accent

  let strokeColor = state.active ? accent : "#aaaaaa"
  let strokeWeight = state.active ? 2.5 : 0.9
  let strokeOpacity = state.active ? 1 : 0.65

  if (state.decorateColor) {
    // Data API는 폴리곤 stroke에 dash pattern을 지원하지 않아 굵은 실선으로 근사
    strokeColor = state.decorateColor
    strokeWeight = 3
    strokeOpacity = 1
  } else if (zoom < BOUNDARY_ZOOM) {
    strokeWeight = 0
    strokeOpacity = 0
  }

  return {
    fillColor,
    fillOpacity,
    strokeColor,
    strokeWeight,
    strokeOpacity,
    clickable: true,
  }
}

export type RegionDataLayer = {
  data: google.maps.Data
  nameToFeature: Map<string, google.maps.Data.Feature>
  /** color/hasPhoto/active/decorate 등 시각 상태 변경 반영 — 부분 갱신 가능 */
  sync: (patch: {
    fills?: Partial<
      Record<string, { type: "color"; value: string } | { type: "image" }>
    >
    hasPhotoRegions?: Set<string>
    activeRegion?: string | null
    decorateRegion?: string | null
    decorateColor?: string
  }) => void
  /** 줌 변경 시 경계선 minzoom 게이팅 재계산 */
  syncZoom: (zoom: number) => void
  destroy: () => void
}

export function createRegionDataLayer(
  map: google.maps.Map,
  geojson: GeoJSON.FeatureCollection,
  opts: {
    accent: string
    initialZoom: number
    onFeatureClick: (name: string, feature: google.maps.Data.Feature) => void
  }
): RegionDataLayer {
  const data = new google.maps.Data({ map })
  data.addGeoJson(geojson)

  const nameToFeature = new Map<string, google.maps.Data.Feature>()
  data.forEach((feature) => {
    const name = feature.getProperty("name")
    if (typeof name === "string") nameToFeature.set(name, feature)
  })

  const states = new Map<string, RegionVisualState>()
  for (const name of nameToFeature.keys()) {
    states.set(name, { hasColor: false, hasPhoto: false, active: false })
  }

  let zoom = opts.initialZoom

  const applyOne = (name: string) => {
    const feature = nameToFeature.get(name)
    const state = states.get(name)
    if (!feature || !state) return
    data.overrideStyle(feature, computeStyle(state, zoom, opts.accent))
  }

  const applyAll = () => {
    for (const name of nameToFeature.keys()) applyOne(name)
  }

  applyAll()

  data.setStyle({ clickable: true, fillOpacity: 0, strokeOpacity: 0 })

  // 배경 클릭 판정과 충돌 방지용 — 같은 클릭 이벤트가 map에도 전파되는지 불확실해 플래그로 방어
  data.addListener("click", (e: google.maps.Data.MouseEvent) => {
    const name = e.feature.getProperty("name")
    if (typeof name === "string") opts.onFeatureClick(name, e.feature)
  })
  data.addListener("mouseover", () => {
    map.getDiv().style.cursor = "pointer"
  })
  data.addListener("mouseout", () => {
    map.getDiv().style.cursor = ""
  })

  return {
    data,
    nameToFeature,
    sync: (patch) => {
      if (patch.fills) {
        for (const [name, state] of states) {
          const fill = patch.fills[name]
          if (fill?.type === "color") {
            state.hasColor = true
            state.color = fill.value
          } else {
            state.hasColor = false
            state.color = undefined
          }
        }
      }
      if (patch.hasPhotoRegions) {
        for (const [name, state] of states) {
          state.hasPhoto = patch.hasPhotoRegions.has(name)
        }
      }
      if (patch.activeRegion !== undefined) {
        for (const [name, state] of states) {
          state.active = name === patch.activeRegion
        }
      }
      if (patch.decorateRegion !== undefined) {
        for (const [name, state] of states) {
          state.decorateColor =
            name === patch.decorateRegion ? patch.decorateColor : undefined
        }
      }
      applyAll()
    },
    syncZoom: (newZoom) => {
      zoom = newZoom
      applyAll()
    },
    destroy: () => {
      data.setMap(null)
    },
  }
}
