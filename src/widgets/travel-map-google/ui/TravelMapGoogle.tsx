import * as React from "react"
import type { TravelMapImplProps } from "./TravelMapGoogleImpl"

import { loadKoreaGeoJson } from "@/shared/lib/loadKoreaGeoJson"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import logoSrc from "@/shared/assets/logo-pinnned.svg"

// Google Maps JS API도 브라우저 전용 → 클라이언트에서만 동적 로드해 SSR 오류 회피.
export function TravelMapGoogle({
  className,
  ...implProps
}: TravelMapImplProps & { className?: string }) {
  const [Impl, setImpl] =
    React.useState<React.ComponentType<TravelMapImplProps> | null>(null)
  // 지역 폴리곤과 Google 기본 타일이 모두 준비된 뒤에만 로딩 오버레이를 닫는다.
  const [layerReady, setLayerReady] = React.useState(false)
  const [tilesReady, setTilesReady] = React.useState(false)
  // GeoJSON은 별도로 추적한다. 실패를 여기서 잡아야 재시도 UI를 띄울 수 있다
  // (Impl 내부 실패는 콘솔에만 남고 영원히 빈 지도가 된다)
  const [geoFailed, setGeoFailed] = React.useState(false)
  const [retryCount, setRetryCount] = React.useState(0)
  const handleReady = React.useCallback(() => setLayerReady(true), [])
  const handleTilesLoaded = React.useCallback(() => setTilesReady(true), [])
  const mapReady = layerReady && tilesReady

  React.useEffect(() => {
    let active = true
    void import("./TravelMapGoogleImpl").then((m) => {
      if (active) setImpl(() => m.TravelMapGoogleImpl)
    })
    return () => {
      active = false
    }
  }, [])

  // Impl 마운트를 기다리지 않고 여기서 먼저 부른다 — Google SDK 로드와 병렬로 굴러가고,
  // 결과는 모듈 캐시에 남아 Impl이 다시 부를 때 그대로 재사용된다
  React.useEffect(() => {
    let active = true
    setGeoFailed(false)
    setLayerReady(false)
    setTilesReady(false)
    loadKoreaGeoJson().catch(() => active && setGeoFailed(true))
    return () => {
      active = false
    }
  }, [retryCount])

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

      {/* 폴리곤이 그려지기 전까지 지도 위를 덮는다 — 회색 빈 지도가 보였다가 폴리곤이
          튀어나오는 걸 막는다. 실패 시엔 재시도 버튼 (기존엔 콘솔 에러만 찍히고
          영원히 빈 지도로 남았다).
          Google 기본 타일과 폴리곤이 모두 준비되면 페이드아웃한다. */}
      <div
        aria-hidden={mapReady}
        aria-busy={!mapReady}
        className={cn(
          // z-10 — 지도 위는 덮되 헤더·하단 내비(z-10, DOM상 뒤)는 덮지 않는다
          "absolute inset-0 z-10 flex items-center justify-center bg-muted transition-opacity duration-300",
          mapReady && "pointer-events-none opacity-0"
        )}
      >
        {geoFailed ? (
          <div className="flex flex-col items-center gap-3 px-8 text-center">
            <p className="text-b6 text-fg-neutral-subtle">
              지도를 불러오지 못했어요.
            </p>
            <Button
              variant="surface"
              radius="full"
              shadow="sm"
              onClick={() => setRetryCount((n) => n + 1)}
            >
              다시 시도
            </Button>
          </div>
        ) : (
          <div
            role="status"
            aria-label="지도를 불러오는 중"
            className="flex flex-col items-center gap-3"
          >
            <img src={logoSrc} alt="Pinnned" className="h-6 animate-pulse" />
            <span aria-hidden="true" className="flex items-center gap-1">
              <i className="size-1.5 animate-bounce rounded-full bg-fg-neutral-subtle [animation-delay:-0.2s]" />
              <i className="size-1.5 animate-bounce rounded-full bg-fg-neutral-subtle [animation-delay:-0.1s]" />
              <i className="size-1.5 animate-bounce rounded-full bg-fg-neutral-subtle" />
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
