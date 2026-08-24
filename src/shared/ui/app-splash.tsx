import { MobileLayout } from "./mobile-layout"
import { LogoStickerCluster } from "./logo-sticker-cluster"
import skyBackgroundSrc from "@/shared/assets/sky-background.png"

/**
 * 라우트 진입 판정 중(세션·팟 persist 복원, me/myParties 응답 대기, 리다이렉트 직전)에
 * 쓰는 전체 화면 대기 상태. 이 구간을 null로 두면 흰 화면만 남는다 —
 * 목 모드에선 한 틱이라 안 보이지만 실서버에선 네트워크 왕복만큼 지속된다.
 *
 * 하늘 배경 + 아웃라인 워드마크·키워드 스티커 클러스터 (Figma 2632-37319 "배경 변경").
 * 그래픽은 LogoStickerCluster로 랜딩(LandingPage)과 공유하고,
 * 대기 상태 표시를 위해 로고 pulse만 이 화면에서 켠다.
 */
export function AppSplash() {
  return (
    <MobileLayout className="relative flex h-dvh flex-col items-center justify-center overflow-hidden bg-bg-neutral-subtle">
      <img
        src={skyBackgroundSrc}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      {/* 시안상 클러스터 중심이 화면 정중앙보다 47px 위 (Figma 로고 y 364/812) */}
      <LogoStickerCluster className="-translate-y-[47px]" logoPulse />
    </MobileLayout>
  )
}
