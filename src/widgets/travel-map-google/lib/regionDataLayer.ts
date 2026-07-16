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
  /** 스와치 탭 즉시 미리 칠할 색 — 저장된 color보다 우선 */
  previewColor?: string
}

function computeStyle(
  state: RegionVisualState,
  zoom: number,
  accent: string
): google.maps.Data.StyleOptions {
  const hasColor = state.hasColor || Boolean(state.previewColor)
  const fillOpacity = state.active
    ? 0.15
    : hasColor
      ? 0.6
      : state.hasPhoto
        ? 0.08
        : 0
  const fillColor =
    state.previewColor ?? (state.hasColor && state.color ? state.color : accent)

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
    decoratePreviewColor?: string
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
  let isAboveBoundary = zoom >= BOUNDARY_ZOOM

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

  // 색칠/사진 지역 수만큼만 유지 — sync가 매번 이 name들만 재계산하면 되므로
  // 전체 ~250개 지역을 매번 순회하는 비용을 피한다
  let prevFillNames = new Set<string>()
  let prevPhotoNames = new Set<string>()
  let prevActiveName: string | null = null
  let prevDecorateName: string | null = null

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
      // 이번 sync로 실제 스타일이 바뀔 수 있는 지역만 모아 그만큼만 재계산한다 —
      // patch.fills/hasPhotoRegions는 매번 "현재 전체" 스냅샷이라, 이전 스냅샷과의
      // 합집합(추가된 것 + 빠진 것)만 영향받는다
      const dirty = new Set<string>()

      if (patch.fills) {
        const nextNames = new Set(Object.keys(patch.fills))
        for (const name of nextNames) dirty.add(name)
        for (const name of prevFillNames) dirty.add(name)
        for (const name of nextNames) {
          const fill = patch.fills[name]
          const state = states.get(name)
          if (!state) continue
          if (fill?.type === "color") {
            state.hasColor = true
            state.color = fill.value
          } else {
            state.hasColor = false
            state.color = undefined
          }
        }
        for (const name of prevFillNames) {
          if (nextNames.has(name)) continue
          const state = states.get(name)
          if (state) {
            state.hasColor = false
            state.color = undefined
          }
        }
        prevFillNames = nextNames
      }
      if (patch.hasPhotoRegions) {
        const next = patch.hasPhotoRegions
        for (const name of next) dirty.add(name)
        for (const name of prevPhotoNames) dirty.add(name)
        for (const name of dirty) {
          const state = states.get(name)
          if (state) state.hasPhoto = next.has(name)
        }
        prevPhotoNames = new Set(next)
      }
      if (patch.activeRegion !== undefined) {
        if (prevActiveName) dirty.add(prevActiveName)
        if (patch.activeRegion) dirty.add(patch.activeRegion)
        if (prevActiveName && prevActiveName !== patch.activeRegion) {
          const prevState = states.get(prevActiveName)
          if (prevState) prevState.active = false
        }
        if (patch.activeRegion) {
          const state = states.get(patch.activeRegion)
          if (state) state.active = true
        }
        prevActiveName = patch.activeRegion
      }
      if (patch.decorateRegion !== undefined) {
        if (prevDecorateName) dirty.add(prevDecorateName)
        if (patch.decorateRegion) dirty.add(patch.decorateRegion)
        if (prevDecorateName && prevDecorateName !== patch.decorateRegion) {
          const prevState = states.get(prevDecorateName)
          if (prevState) {
            prevState.decorateColor = undefined
            prevState.previewColor = undefined
          }
        }
        if (patch.decorateRegion) {
          const state = states.get(patch.decorateRegion)
          if (state) {
            state.decorateColor = patch.decorateColor
            state.previewColor = patch.decoratePreviewColor
          }
        }
        prevDecorateName = patch.decorateRegion
      }

      for (const name of dirty) applyOne(name)
    },
    syncZoom: (newZoom) => {
      zoom = newZoom
      // BOUNDARY_ZOOM 경계를 넘나들 때만 스타일이 실제로 바뀐다 — 매 프레임 오는
      // zoom_changed마다 전체 재계산하면 스크롤 줌 중 심하게 끊긴다
      const nowAboveBoundary = zoom >= BOUNDARY_ZOOM
      if (nowAboveBoundary === isAboveBoundary) return
      isAboveBoundary = nowAboveBoundary
      applyAll()
    },
    destroy: () => {
      data.setMap(null)
    },
  }
}
