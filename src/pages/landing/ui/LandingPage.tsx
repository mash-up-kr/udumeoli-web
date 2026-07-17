import { useRouter } from "@tanstack/react-router"

import { ButtonCta } from "@/shared/ui/button-cta"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { RedirectIfAuthed } from "@/features/auth"
import iconKakaoSrc from "@/shared/assets/icon-kakao.svg"
import logoPhotatoSrc from "@/shared/assets/logo-photato.svg"
import mashUpSrc from "@/shared/assets/mash-up.jpg"

export function LandingPage() {
  const router = useRouter()
  return (
    <RedirectIfAuthed>
      {/* Figma 스플래시: padding 24/16/32/16, CTA(343)는 홈 인디케이터 바로 위 */}
      <MobileLayout className="relative flex h-dvh flex-col items-start gap-4 px-4 pt-6 pb-[34px]">
        <img
          src={logoPhotatoSrc}
          alt="PHOTATO"
          className="h-[60px] w-[120px]"
        />

        <p className="text-h3-1 whitespace-pre-line text-fg-neutral-bold">
          {"로그인하고\n서비스를 사용해 보세요"}
        </p>

        {/* 그래픽 슬롯 (Figma 343×335, radius 10) — 임시 개발팀 마스코트, 추후 실제 그래픽으로 교체 */}
        <img
          src={mashUpSrc}
          alt=""
          className="absolute inset-x-4 top-1/2 h-[335px] -translate-y-1/2 rounded-[10px] object-cover"
        />

        <div className="flex-1" />

        {/* 카카오 브랜드 색(#FDE500/#3C1E1E)은 디자인 시스템 팔레트 밖이라 예외적으로 hex 사용 */}
        <ButtonCta
          className="gap-2 bg-[#FDE500] text-[#3C1E1E]"
          onClick={() => router.navigate({ to: "/signup" })}
        >
          <img src={iconKakaoSrc} alt="" className="size-6" />
          카카오로 시작하기
        </ButtonCta>
      </MobileLayout>
    </RedirectIfAuthed>
  )
}
