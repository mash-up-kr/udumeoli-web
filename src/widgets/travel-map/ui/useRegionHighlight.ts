import * as React from "react"
import type { Map as MapLibreMap } from "maplibre-gl"

export function useRegionHighlight() {
  const activeRef = React.useRef<{ src: string; id: string | number } | null>(
    null
  )
  const nameToId = React.useRef(new Map<string, number>())

  const activate = React.useCallback(
    (map: MapLibreMap, srcId: string, id: string | number | undefined) => {
      if (id === undefined) return
      if (activeRef.current !== null) {
        map.setFeatureState(
          { source: activeRef.current.src, id: activeRef.current.id },
          { active: false }
        )
      }
      if (
        activeRef.current !== null &&
        activeRef.current.src === srcId &&
        activeRef.current.id === id
      ) {
        activeRef.current = null
      } else {
        activeRef.current = { src: srcId, id }
        map.setFeatureState({ source: srcId, id }, { active: true })
      }
    },
    []
  )

  const buildNameIndex = React.useCallback(
    (features: Array<GeoJSON.Feature>) => {
      for (const f of features) {
        if (f.id !== undefined && f.properties?.name) {
          nameToId.current.set(f.properties.name as string, f.id as number)
        }
      }
    },
    []
  )

  const setupClickHandler = React.useCallback(
    (
      map: MapLibreMap,
      fillId: string,
      onRegionClick?: (name: string, feature: GeoJSON.Feature) => void
    ) => {
      map.on("click", fillId, (e) => {
        const feature = e.features?.[0]
        if (!feature) return
        if (onRegionClick && feature.properties.name) {
          onRegionClick(String(feature.properties.name), feature)
        }
      })
      map.on("mouseenter", fillId, () => {
        map.getCanvas().style.cursor = "pointer"
      })
      map.on("mouseleave", fillId, () => {
        map.getCanvas().style.cursor = ""
      })
    },
    []
  )

  const activateByName = React.useCallback(
    (map: MapLibreMap, srcId: string, name: string) => {
      activate(map, srcId, nameToId.current.get(name))
    },
    [activate]
  )

  // 토글 없이 지정 지역만 활성화(null이면 해제) — selectedRegion과 1:1로 동기화할 때 사용
  const setActiveByName = React.useCallback(
    (map: MapLibreMap, srcId: string, name: string | null) => {
      if (activeRef.current !== null) {
        map.setFeatureState(
          { source: activeRef.current.src, id: activeRef.current.id },
          { active: false }
        )
        activeRef.current = null
      }
      if (name === null) return
      const id = nameToId.current.get(name)
      if (id === undefined) return
      activeRef.current = { src: srcId, id }
      map.setFeatureState({ source: srcId, id }, { active: true })
    },
    []
  )

  return {
    setupClickHandler,
    activateByName,
    setActiveByName,
    buildNameIndex,
    nameToIdRef: nameToId,
  }
}
