// google.maps.OverlayView 기반 canvas 이미지-fill 오버레이.
//
// MapLibre 구현은 `map.project(lngLat)`로 화면 좌표를 직접 얻어 canvas에 그리는데,
// Google Maps는 `OverlayView.getProjection().fromLatLngToDivPixel()`로 같은 역할을 한다.
// 다만 Google은 오버레이 pane 자체가 지도 이동에 따라 CSS transform으로 움직이므로,
// canvas를 뷰포트 크기로만 두고 매 draw()마다 위치·크기를 다시 계산해야 한다
// (MapLibre처럼 canvas를 컨테이너에 고정해두고 좌표만 다시 계산하는 것보다 번거로움 — 포팅 시 가장 손이 많이 간 지점).

type RegionFill =
  | { type: "color"; value: string }
  | { type: "image"; imageId: string; dataUrl: string }

// `extends google.maps.OverlayView`는 클래스 선언 시점에 `google.maps`를 평가하는데,
// APIProvider가 Maps JS SDK 스크립트를 비동기로 넣기 전에 이 모듈이 import되면
// "google is not defined"로 죽는다. 그래서 클래스 정의를 함수 안에 가둬 SDK 로드 후
// (= 이 팩토리가 실제 호출되는 시점, google.maps 사용 가능할 때)에만 평가되게 한다.
export function createImageFillOverlay(
  getFills: () => Record<string, RegionFill>,
  getGeojson: () => GeoJSON.FeatureCollection | null
) {
  class ImageFillOverlayImpl extends google.maps.OverlayView {
    private canvas = document.createElement("canvas")
    private imgCache = new Map<string, HTMLImageElement>()

    constructor() {
      super()
      this.canvas.style.position = "absolute"
      this.canvas.style.pointerEvents = "none"
    }

    override onAdd() {
      this.getPanes()?.overlayLayer.appendChild(this.canvas)
    }

    override onRemove() {
      this.canvas.remove()
    }

    /** fills에 새 이미지가 추가되면 로드해서 캐시, 완료 후 재드로우 */
    loadPendingImages(onLoaded: () => void) {
      const fills = getFills()
      const pending = Object.values(fills).filter(
        (f): f is Extract<RegionFill, { type: "image" }> =>
          f.type === "image" && !this.imgCache.has(f.imageId)
      )
      if (pending.length === 0) return
      Promise.all(
        pending.map(
          (f) =>
            new Promise<void>((resolve) => {
              const img = new Image()
              img.onload = () => {
                this.imgCache.set(f.imageId, img)
                resolve()
              }
              img.onerror = () => resolve()
              img.src = f.dataUrl
            })
        )
      ).then(onLoaded)
    }

    override draw() {
      // @types/google.maps는 getProjection()을 non-nullable로 선언하지만,
      // onAdd() 이전 시점엔 실제로 undefined일 수 있어 방어적으로 재단언한다.
      const projection = this.getProjection() as
        | google.maps.MapCanvasProjection
        | undefined
      const map = this.getMap()
      if (!projection || !(map instanceof google.maps.Map)) return
      const bounds = map.getBounds()
      if (!bounds) return

      const ne = bounds.getNorthEast()
      const sw = bounds.getSouthWest()
      const topRight = projection.fromLatLngToDivPixel(
        new google.maps.LatLng(ne.lat(), ne.lng())
      )
      const bottomLeft = projection.fromLatLngToDivPixel(
        new google.maps.LatLng(sw.lat(), sw.lng())
      )
      if (!topRight || !bottomLeft) return

      const cssWidth = topRight.x - bottomLeft.x
      const cssHeight = bottomLeft.y - topRight.y
      if (cssWidth <= 0 || cssHeight <= 0) return

      this.canvas.style.left = `${bottomLeft.x}px`
      this.canvas.style.top = `${topRight.y}px`

      const dpr = window.devicePixelRatio || 1
      this.canvas.width = cssWidth * dpr
      this.canvas.height = cssHeight * dpr
      this.canvas.style.width = `${cssWidth}px`
      this.canvas.style.height = `${cssHeight}px`

      const ctx = this.canvas.getContext("2d")
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, cssWidth, cssHeight)

      const geojson = getGeojson()
      if (!geojson) return

      for (const [region, fill] of Object.entries(getFills())) {
        if (fill.type !== "image") continue
        const img = this.imgCache.get(fill.imageId)
        if (!img) continue

        const feature = geojson.features.find(
          (f) => f.properties?.name === region
        )
        if (!feature) continue

        const geometry = feature.geometry
        const polys =
          geometry.type === "Polygon"
            ? [geometry.coordinates]
            : geometry.type === "MultiPolygon"
              ? geometry.coordinates
              : []
        if (polys.length === 0) continue

        let minX = Infinity
        let maxX = -Infinity
        let minY = Infinity
        let maxY = -Infinity

        ctx.save()
        ctx.beginPath()
        for (const poly of polys) {
          poly[0].forEach(([lng, lat]: Array<number>, i: number) => {
            const pt = projection.fromLatLngToDivPixel(
              new google.maps.LatLng(lat, lng)
            )
            if (!pt) return
            const x = pt.x - bottomLeft.x
            const y = pt.y - topRight.y
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
            minX = Math.min(minX, x)
            maxX = Math.max(maxX, x)
            minY = Math.min(minY, y)
            maxY = Math.max(maxY, y)
          })
          ctx.closePath()
        }
        ctx.clip()

        if (minX < Infinity) {
          const w = maxX - minX
          const h = maxY - minY
          const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight)
          const dw = img.naturalWidth * scale
          const dh = img.naturalHeight * scale
          ctx.globalAlpha = 0.85
          ctx.drawImage(img, minX + (w - dw) / 2, minY + (h - dh) / 2, dw, dh)
        }
        ctx.restore()
      }
    }
  }

  return new ImageFillOverlayImpl()
}

export type ImageFillOverlay = ReturnType<typeof createImageFillOverlay>
