import * as React from "react"
import { useRouter, useSearch } from "@tanstack/react-router"

import { setTokens } from "@/shared/api/token-storage"
import { showToast } from "@/shared/ui/toast"
import { getPendingInviteCode } from "@/entities/travel-pot"
import { fetchMe, useSessionStore } from "@/entities/user"
import { exchangeLoginCode, setSignupToken } from "@/features/auth"

/** 백엔드 카카오 콜백이 ?code(성공) 또는 ?error(실패)를 붙여 보내는 착지 페이지. */
export function LoginCallbackPage() {
  const router = useRouter()
  const login = useSessionStore((s) => s.login)
  const { code, error } = useSearch({ from: "/login/callback" })

  // StrictMode 이중 실행 방지 — 교환 코드는 1회용이라 두 번 부르면 두 번째가 401이 된다
  const ran = React.useRef(false)
  React.useEffect(() => {
    if (ran.current) return
    ran.current = true

    const fail = (message: string) => {
      showToast({ message, icon: "alert" })
      void router.navigate({ to: "/", replace: true })
    }

    if (error || !code) {
      fail("카카오 로그인에 실패했어요. 다시 시도해 주세요.")
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
          // 초대링크로 왔다가 로그인한 경우 — 지도 대신 코드 입력 화면으로 복귀.
          // 이미 팟이 있는 유저는 지도가 pot-start로 보내주지 않아 여기서 갈라야 한다
          void router.navigate({
            to: getPendingInviteCode() ? "/pot-join" : "/map-google",
            replace: true,
          })
          return
        }
        fail("카카오 로그인에 실패했어요. 다시 시도해 주세요.")
      } catch {
        // 교환 코드 만료(2분)·재사용 포함
        fail("로그인이 만료됐어요. 다시 시도해 주세요.")
      }
    })()
  }, [code, error, login, router])

  return null
}
