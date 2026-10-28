import * as React from "react"
import { useRouter } from "@tanstack/react-router"

import { AppSplash } from "@/shared/ui/app-splash"
import { ButtonCta } from "@/shared/ui/button-cta"
import { API_BASE_URL, USE_MOCK } from "@/shared/api/client"
import { isIos } from "@/shared/lib/is-ios"
import { APP_LOGIN_MARKER } from "@/shared/lib/app-login"
import { RedirectIfAuthed } from "@/features/auth"
import iconAppleSrc from "@/shared/assets/icon-apple.svg"
import iconGoogleSrc from "@/shared/assets/icon-google.svg"
import iconKakaoSrc from "@/shared/assets/icon-kakao.svg"

type Provider = "kakao" | "apple" | "google"

/**
 * 서비스 진입 화면 — 스플래시 모션 영상(AppSplash와 공유) + 하단 소셜 로그인 CTA.
 * 세 provider 모두 백엔드 OAuth 리다이렉트 한 가지 방식이다 (Apple·Google의 Return URL은 백엔드 주소로만 등록돼 있다).
 * 카카오·Google은 항상, Apple은 iOS에서만 노출 (App Store 심사 4.8 — 서드파티 로그인이 있으면 Apple 로그인 필수).
 * CTA 개수가 바뀌면 shared/lib/landing-toast의 토스트 오프셋도 같이 맞출 것.
 */
export function LandingPage() {
  const router = useRouter()
  React.useEffect(() => {
    window.sessionStorage.removeItem(APP_LOGIN_MARKER)
  }, [])
  const [splashDone, setSplashDone] = React.useState(false)
  const finishSplash = () => setSplashDone(true)
  // SSR엔 navigator가 없어 마운트 후 판별 — CTA는 스플래시 종료 후에야 보여서 깜빡임은 없다
  const [showApple, setShowApple] = React.useState(false)
  React.useEffect(() => {
    setShowApple(isIos())
  }, [])

  // 저전력 모드 등 autoplay 차단 환경에선 ended가 안 와 CTA가 영영 안 뜬다 — 타임아웃 폴백 (영상 4초)
  React.useEffect(() => {
    const id = window.setTimeout(finishSplash, 5000)
    return () => window.clearTimeout(id)
  }, [])

  const startLogin = (provider: Provider) => {
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
      `${API_BASE_URL}/oauth2/authorization/${provider}?frontendRedirect=${callback}`
    )
  }

  return (
    <RedirectIfAuthed>
      <AppSplash onMotionEnd={finishSplash}>
        {/* CTA — Action Area px-16, 홈 인디케이터 영역(34px) 위. 스플래시 모션 종료 후 페이드인.
            absolute가 아니라 fixed다 — 스플래시는 100dvh + overflow-hidden이라 스크롤로
            만회할 수 없는데, 아이폰 사파리 "단일 탭"(검색창 위) 설정은 하단 툴바가 따로 떠서
            버튼 아래 여유 34px을 넘겨 잘렸다. fixed는 사파리가 툴바 위로 올려준다.
            하단 내비(TravelAlbumPage)가 이미 쓰는 방식이다.
            mx-auto max-w-md는 MobileLayout과 같은 폭·정렬이라 위치는 그대로다. */}
        <div
          className={
            splashDone
              ? "fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-md animate-in flex-col gap-3 px-4 pb-[max(env(safe-area-inset-bottom),34px)] duration-300 fade-in-0"
              : "hidden"
          }
        >
          {/* 카카오 브랜드 색(#FDE500/#3C1E1E)은 디자인 시스템 팔레트 밖이라 예외적으로 hex 사용 */}
          <ButtonCta
            className="gap-2 bg-[#FDE500] text-[#3C1E1E]"
            onClick={() => startLogin("kakao")}
          >
            <img src={iconKakaoSrc} alt="" className="size-6" />
            카카오로 시작하기
          </ButtonCta>
          {/* Apple 버튼 가이드: 다른 로그인 버튼과 같은 크기, 검정 배경·흰 로고 — primary 토큰이 그대로 맞는다 */}
          {showApple && (
            <ButtonCta className="gap-2" onClick={() => startLogin("apple")}>
              <img src={iconAppleSrc} alt="" className="size-6" />
              Apple로 시작하기
            </ButtonCta>
          )}
          {/* Google 버튼 가이드: 흰 배경 + 컬러 G 로고. G는 24px 박스를 꽉 채워 카카오(16px 글리프)보다 커 보여 18px로 */}
          <ButtonCta
            className="gap-2 bg-bg-neutral-weak text-fg-neutral-bold"
            onClick={() => startLogin("google")}
          >
            <img src={iconGoogleSrc} alt="" className="size-4.5" />
            Google로 시작하기
          </ButtonCta>
        </div>
      </AppSplash>
    </RedirectIfAuthed>
  )
}
