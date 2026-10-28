import * as React from "react"
import { useRouter, useSearch } from "@tanstack/react-router"

import { setTokens } from "@/shared/api/token-storage"
import { showToast } from "@/shared/ui/toast"
import { getPendingInviteCode } from "@/entities/travel-pot"
import { fetchMe, useSessionStore } from "@/entities/user"
import { exchangeLoginCode, setSignupToken } from "@/features/auth"
import { trackEvent } from "@/shared/api/analytics"
import { landingToastClassName } from "@/shared/lib/landing-toast"
import {
  APP_LOGIN_MARKER,
  APP_LOGIN_SCHEME,
  isAppLoginPending,
} from "@/shared/lib/app-login"
import { ButtonCta } from "@/shared/ui/button-cta"
import { MobileLayout } from "@/shared/ui/mobile-layout"

/** 백엔드 소셜 로그인(카카오·Apple·Google) 콜백이 ?code(성공) 또는 ?error(실패)를 붙여 보내는 착지 페이지. */
export function LoginCallbackPage() {
  const router = useRouter()
  const login = useSessionStore((s) => s.login)
  const { code, error } = useSearch({ from: "/login/callback" })
  const [returnToApp, setReturnToApp] = React.useState<boolean | null>(null)
  const [appRedirectFailed, setAppRedirectFailed] = React.useState(false)

  React.useEffect(() => {
    setReturnToApp(
      isAppLoginPending(window.sessionStorage.getItem(APP_LOGIN_MARKER))
    )
  }, [])

  const appRedirected = React.useRef(false)
  React.useEffect(() => {
    if (!returnToApp || !code || error || appRedirected.current) return
    appRedirected.current = true
    const timeout = window.setTimeout(() => {
      if (document.visibilityState === "visible") setAppRedirectFailed(true)
    }, 1500)
    const clearTimeoutOnHide = () => window.clearTimeout(timeout)
    window.addEventListener("pagehide", clearTimeoutOnHide, { once: true })
    window.location.replace(
      `${APP_LOGIN_SCHEME}://login/callback?code=${encodeURIComponent(code)}`
    )
    return () => {
      appRedirected.current = false
      window.clearTimeout(timeout)
      window.removeEventListener("pagehide", clearTimeoutOnHide)
    }
  }, [code, error, returnToApp])

  // StrictMode 이중 실행 방지 — 교환 코드는 1회용이라 두 번 부르면 두 번째가 401이 된다
  const ran = React.useRef(false)
  React.useEffect(() => {
    if (returnToApp === null || (returnToApp && code && !error)) return
    if (ran.current) return
    ran.current = true

    const fail = (message: string) => {
      showToast({ message, icon: "alert", className: landingToastClassName() })
      void router.navigate({ to: "/", replace: true })
    }

    if (error || !code) {
      fail("로그인에 실패했어요. 다시 시도해 주세요.")
      return
    }

    void (async () => {
      try {
        const result = await exchangeLoginCode(code)
        if (result.status === "SIGNUP_REQUIRED" && result.signupToken) {
          setSignupToken(result.signupToken)
          void router.navigate({ to: "/signup", replace: true })
          return
        }
        if (result.status === "AUTHENTICATED" && result.tokens) {
          setTokens(result.tokens)
          login(await fetchMe())
          trackEvent("login_completed")
          // 초대링크로 왔다가 로그인한 경우 — 지도 대신 참여 플로우로 복귀.
          // 이미 팟이 있는 유저는 지도가 pot-start로 보내주지 않아 여기서 갈라야 한다
          const pendingCode = getPendingInviteCode()
          if (pendingCode) {
            void router.navigate({
              to: "/pot-join",
              search: { inviteCode: pendingCode },
              replace: true,
            })
          } else {
            void router.navigate({ to: "/map-google", replace: true })
          }
          return
        }
        fail("로그인에 실패했어요. 다시 시도해 주세요.")
      } catch {
        // 교환 코드 만료(2분)·재사용 포함
        fail("로그인이 만료됐어요. 다시 시도해 주세요.")
      }
    })()
  }, [code, error, login, returnToApp, router])

  if (appRedirectFailed && returnToApp && code && !error) {
    return (
      <MobileLayout className="flex flex-col justify-center gap-6 px-4 text-center">
        <div>
          <h1 className="text-h3 text-fg-neutral-bold">앱을 열지 못했어요</h1>
          <p className="mt-2 text-b7 text-fg-neutral-subtle">
            다시 시도하거나 웹에서 로그인을 완료해 주세요.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <ButtonCta
            onClick={() => {
              window.location.href = `${APP_LOGIN_SCHEME}://login/callback?code=${encodeURIComponent(code)}`
            }}
          >
            앱에서 다시 시도
          </ButtonCta>
          <ButtonCta
            variant="secondary"
            onClick={() => {
              window.sessionStorage.removeItem(APP_LOGIN_MARKER)
              setReturnToApp(false)
            }}
          >
            웹에서 계속
          </ButtonCta>
        </div>
      </MobileLayout>
    )
  }

  return null
}
