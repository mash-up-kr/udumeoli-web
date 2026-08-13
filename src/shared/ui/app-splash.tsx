import { MobileLayout } from "./mobile-layout"

/**
 * 라우트 진입 판정 중(세션·팟 persist 복원, me/myParties 응답 대기, 리다이렉트 직전)에
 * 쓰는 전체 화면 대기 상태. 이 구간을 null로 두면 흰 화면만 남는다 —
 * 목 모드에선 한 틱이라 안 보이지만 실서버에선 네트워크 왕복만큼 지속된다.
 */
export function AppSplash() {
  return (
    <MobileLayout className="flex h-dvh flex-col items-center justify-center">
      {/* 랜딩과 같은 워드마크 — 별도 스피너 에셋 없이 브랜드로 대기 상태를 채운다 */}
      <span className="animate-pulse font-eng text-[40px] text-fg-neutral-bold">
        Pinnnned
      </span>
    </MobileLayout>
  )
}
