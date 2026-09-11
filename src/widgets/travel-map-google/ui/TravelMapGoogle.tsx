import * as React from "react"
import { getMapLoadingState } from "../lib/mapLoading"
import type { TravelMapImplProps } from "./TravelMapGoogleImpl"

import { loadKoreaGeoJson } from "@/shared/lib/loadKoreaGeoJson"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import pinHeartSrc from "@/shared/assets/icon-pin-heart.svg"

const GOOGLE_TILE_TIMEOUT_MS = 10_000

// Google Maps JS API도 브라우저 전용 → 클라이언트에서만 동적 로드해 SSR 오류 회피.
export function TravelMapGoogle({
  className,
  onMapReady,
  ...implProps
}: TravelMapImplProps & { className?: string }) {
  const [Impl, setImpl] =
    React.useState<React.ComponentType<TravelMapImplProps> | null>(null)
  // 지역 폴리곤과 Google 기본 타일이 모두 준비된 뒤에만 로딩 오버레이를 닫는다.
  const [layerReady, setLayerReady] = React.useState(false)
  const [tilesReady, setTilesReady] = React.useState(false)
  // GeoJSON은 별도로 추적한다. 실패를 여기서 잡아야 재시도 UI를 띄울 수 있다
  // (Impl 내부 실패는 콘솔에만 남고 영원히 빈 지도가 된다)
  const [implFailed, setImplFailed] = React.useState(false)
  const [geoFailed, setGeoFailed] = React.useState(false)
  const [tilesTimedOut, setTilesTimedOut] = React.useState(false)
  const [retrying, setRetrying] = React.useState(false)
  const [retryCount, setRetryCount] = React.useState(0)
  const handleReady = React.useCallback(() => setLayerReady(true), [])
  const handleTilesLoaded = React.useCallback(() => {
    setTilesReady(true)
    setTilesTimedOut(false)
  }, [])
  const mapReady = layerReady && tilesReady

  React.useEffect(() => {
    onMapReady?.(mapReady)
  }, [mapReady, onMapReady])
  const loadingState = getMapLoadingState({
    implFailed,
    geoFailed,
    layerReady,
    tilesReady,
    tilesTimedOut,
  })

  React.useEffect(() => {
    let active = true
    setImpl(null)
    setImplFailed(false)
    void import("./TravelMapGoogleImpl")
      .then((m) => {
        if (active) setImpl(() => m.TravelMapGoogleImpl)
      })
      .catch(() => {
        if (active) setImplFailed(true)
      })
    return () => {
      active = false
    }
  }, [retryCount])

  // Impl 마운트를 기다리지 않고 여기서 먼저 부른다 — Google SDK 로드와 병렬로 굴러가고,
  // 결과는 모듈 캐시에 남아 Impl이 다시 부를 때 그대로 재사용된다
  React.useEffect(() => {
    let active = true
    setGeoFailed(false)
    setLayerReady(false)
    setTilesReady(false)
    setTilesTimedOut(false)
    loadKoreaGeoJson().catch(() => active && setGeoFailed(true))
    return () => {
      active = false
    }
  }, [retryCount])

  React.useEffect(() => {
    if (tilesReady) return
    const timeoutId = window.setTimeout(
      () => setTilesTimedOut(true),
      GOOGLE_TILE_TIMEOUT_MS
    )
    return () => window.clearTimeout(timeoutId)
  }, [retryCount, tilesReady])

  React.useEffect(() => {
    if (mapReady || implFailed || geoFailed || tilesTimedOut) setRetrying(false)
  }, [geoFailed, implFailed, mapReady, tilesTimedOut])

  const handleRetry = () => {
    if (retrying) return
    setRetrying(true)
    setRetryCount((n) => n + 1)
  }

  return (
    <div className={cn("relative size-full overflow-hidden", className)}>
      {/* 재시도 시에는 지도를 통째로 새로 마운트한다 — 초기화 effect가 map 인스턴스
          기준이라, 리마운트 없이는 실패한 GeoJSON 로드를 다시 태울 방법이 없다 */}
      {Impl ? (
        <Impl
          key={retryCount}
          {...implProps}
          onReady={handleReady}
          onTilesLoaded={handleTilesLoaded}
        />
      ) : null}

      {/* 폴리곤이 그려지기 전까지 지도 위를 덮는다. 실패 시엔 재시도 버튼 (기존엔
          콘솔 에러만 찍히고 영원히 빈 지도로 남았다).
          Google 기본 타일과 폴리곤이 모두 준비되면 페이드아웃한다.
          배경은 시안 3065-19357 Dim_white — 불투명하게 덮지 않고 뿌옇게 흐린다. */}
      <div
        aria-hidden={loadingState === "ready"}
        aria-busy={loadingState === "loading" || retrying}
        className={cn(
          // z-10 — 지도 위는 덮되 헤더·하단 내비(z-10, DOM상 뒤)는 덮지 않는다
          "absolute inset-0 z-10 flex items-center justify-center bg-white/5 backdrop-blur-[20px] transition-opacity duration-300",
          mapReady && "pointer-events-none opacity-0"
        )}
      >
        {loadingState === "impl-error" ||
        loadingState === "geo-error" ||
        loadingState === "tiles-error" ? (
          <div
            aria-live="assertive"
            aria-busy={retrying}
            className="flex flex-col items-center gap-3 px-8 text-center"
          >
            <p className="text-b6 text-fg-neutral-subtle">
              {loadingState === "impl-error"
                ? "지도를 불러오는 중 문제가 발생했어요."
                : loadingState === "geo-error"
                  ? "지도 경계 데이터를 불러오지 못했어요."
                  : "지도가 준비되지 않았어요. 네트워크 상태를 확인해 주세요."}
            </p>
            <Button
              variant="surface"
              radius="full"
              shadow="sm"
              disabled={retrying}
              aria-busy={retrying}
              onClick={handleRetry}
            >
              {retrying ? "다시 불러오는 중" : "다시 시도"}
            </Button>
          </div>
        ) : (
          /* 시안 3065-19371 — 핀 심볼만 바운스하고 두 텍스트는 고정 */
          <div
            role="status"
            aria-label="지도를 불러오는 중"
            className="flex flex-col items-center gap-4 px-4 py-2"
          >
            <div className="flex flex-col items-center gap-4">
              <img
                src={pinHeartSrc}
                alt=""
                className="h-[37.93px] w-8 animate-pin-bounce"
              />
              <p className="font-eng text-e1 text-fg-neutral-bold">Loading</p>
            </div>
            <p className="text-h4 text-fg-neutral-solid">
              잠시만 기다려주세요...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
