import { MobileLayout } from "./mobile-layout"
import type { ReactNode } from "react"

import skyBackgroundSrc from "@/shared/assets/sky-background.png"

/**
 * 라우트 진입 판정 중(세션·팟 persist 복원, me/myParties 응답 대기, 리다이렉트 직전)에
 * 쓰는 전체 화면 대기 상태. 이 구간을 null로 두면 흰 화면만 남는다 —
 * 목 모드에선 한 틱이라 안 보이지만 실서버에선 네트워크 왕복만큼 지속된다.
 *
 * 스플래시 모션 영상(Video_Splash_5_FIN, 4초 1회 재생 후 마지막 프레임 유지).
 * 영상 로드 전엔 poster(하늘 배경)가 정적 스플래시 역할을 한다.
 * sw.js가 /splash.mp4를 프리캐시해 PWA·재방문에선 즉시 재생된다.
 *
 * 랜딩(LandingPage)은 children으로 CTA를 얹어 같은 화면을 공유한다.
 */
export function AppSplash({
  children,
  onMotionEnd,
}: {
  children?: ReactNode
  /** 스플래시 모션 종료 시점에 호출 — 랜딩이 CTA 노출 시점으로 쓴다. 중복 호출될 수 있다 */
  onMotionEnd?: () => void
}) {
  return (
    <MobileLayout className="relative flex h-dvh flex-col items-center justify-center overflow-hidden bg-bg-neutral-subtle">
      <video
        src="/splash.mp4"
        poster={skyBackgroundSrc}
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover"
        onEnded={onMotionEnd}
        onError={onMotionEnd}
        // 영상 끝은 마지막 프레임 유지 구간이라 ended까지 기다리면 CTA가 늦게 뜬다 — 2초 전 미리 알림
        onTimeUpdate={(event) => {
          const video = event.currentTarget
          if (video.duration - video.currentTime <= 2) onMotionEnd?.()
        }}
      />
      {children}
    </MobileLayout>
  )
}
