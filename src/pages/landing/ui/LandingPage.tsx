import { useRouter } from "@tanstack/react-router"

import { ButtonCta } from "@/shared/ui/button-cta"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { LogoStickerCluster } from "@/shared/ui/logo-sticker-cluster"
import { API_BASE_URL, USE_MOCK } from "@/shared/api/client"
import { RedirectIfAuthed } from "@/features/auth"
import iconKakaoSrc from "@/shared/assets/icon-kakao.svg"
import skyBackgroundSrc from "@/shared/assets/sky-background.png"

/**
 * 서비스 진입 화면 (Figma 2632-37293 "배경 변경").
 * 하늘 배경 + 워드마크·스티커 클러스터(AppSplash와 공유) + 하단 카카오 CTA.
 */
export function LandingPage() {
  const router = useRouter()
  return (
    <RedirectIfAuthed>
      <MobileLayout className="relative flex h-dvh flex-col items-center justify-center overflow-hidden bg-bg-neutral-subtle">
        <img
          src={skyBackgroundSrc}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        {/* 시안상 클러스터 중심이 화면 정중앙보다 47px 위 (Figma 로고 y 364/812) */}
        <LogoStickerCluster className="-translate-y-[47px]" />

        {/* CTA — Action Area px-16, 홈 인디케이터 영역(34px) 위 */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-[max(env(safe-area-inset-bottom),34px)]">
          {/* 카카오 브랜드 색(#FDE500/#3C1E1E)은 디자인 시스템 팔레트 밖이라 예외적으로 hex 사용 */}
          <ButtonCta
            className="gap-2 bg-[#FDE500] text-[#3C1E1E]"
            onClick={() => {
              if (USE_MOCK) {
                void router.navigate({ to: "/signup" })
                return
              }
              // 프록시를 경유하면 백엔드 OAuth 세션 쿠키가 우리 도메인에 심겨 state 검증이 깨진다 — 직접 이동
              // frontendRedirect: 로그인 완료 후 돌아올 콜백 — 백엔드가 화이트리스트 검증 (로컬 dev 복귀에 필요해 유지)
              const callback = encodeURIComponent(
                `${window.location.origin}/login/callback`
              )
              window.location.assign(
                `${API_BASE_URL}/oauth2/authorization/kakao?frontendRedirect=${callback}`
              )
            }}
          >
            <img src={iconKakaoSrc} alt="" className="size-6" />
            카카오로 시작하기
          </ButtonCta>
        </div>
      </MobileLayout>
    </RedirectIfAuthed>
  )
}
