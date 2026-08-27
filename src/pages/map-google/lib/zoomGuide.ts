// 줌인 가이드(시안 2822-8047) 노출 이력 — 한 번 3단계까지 줌인하면 다시 띄우지 않는다.
// completionTips(widgets/travel-map-google)와 같은 localStorage 1회 노출 패턴.

const ZOOM_GUIDE_STORAGE_KEY = "photato-map-zoom-guide-seen"

export function hasSeenZoomGuide(): boolean {
  if (typeof window === "undefined") return true
  return window.localStorage.getItem(ZOOM_GUIDE_STORAGE_KEY) === "1"
}

export function markZoomGuideSeen() {
  if (typeof window === "undefined") return
  window.localStorage.setItem(ZOOM_GUIDE_STORAGE_KEY, "1")
}
