const MEASUREMENT_ID = "G-0D3HZ92ZME"
const SCRIPT_ID = "google-analytics"

declare global {
  interface Window {
    dataLayer?: Array<IArguments>
    gtag?: (...args: Array<unknown>) => void
  }
}

/** OAuth 콜백에서는 코드를 포함한 URL이 수집되지 않도록 GA 로드를 미룬다. */
export function initializeGoogleAnalytics(): void {
  if (!import.meta.env.PROD || typeof window === "undefined") return
  if (
    window.location.pathname === "/login/callback" ||
    window.location.pathname === "/login/callback/" ||
    document.getElementById(SCRIPT_ID)
  ) {
    return
  }

  const dataLayer = (window.dataLayer ??= [])
  window.gtag = function () {
    dataLayer.push(arguments)
  }
  window.gtag("js", new Date())
  window.gtag("config", MEASUREMENT_ID, {
    // 자체 분석과 동일하게 referrer는 origin만 사용해 인증 쿼리를 제외한다.
    page_referrer: document.referrer ? new URL(document.referrer).origin : "",
  })

  const script = document.createElement("script")
  script.id = SCRIPT_ID
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
  document.head.appendChild(script)
}
