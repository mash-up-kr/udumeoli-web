import { initializeAnalytics } from "firebase/analytics"

import { getFirebaseApp } from "./firebase"

const MEASUREMENT_ID = "G-0D3HZ92ZME"
const SCRIPT_ID = "google-analytics"

let firebaseAnalyticsInitialized = false

declare global {
  interface Window {
    dataLayer?: Array<IArguments>
    gtag?: (...args: Array<unknown>) => void
  }
}

/**
 * OAuth 콜백에서는 코드를 포함한 URL이 수집되지 않도록 GA 로드를 미룬다.
 * Analytics를 쓸 수 있는 상태면 true를 돌려준다 (Remote Config는 그 뒤에 초기화해야 실험 배정이 기록된다).
 */
export function initializeGoogleAnalytics(): boolean {
  if (!import.meta.env.PROD || typeof window === "undefined") return false
  if (
    window.location.pathname === "/login/callback" ||
    window.location.pathname === "/login/callback/"
  ) {
    return false
  }
  if (firebaseAnalyticsInitialized || document.getElementById(SCRIPT_ID)) {
    return true
  }

  // 자체 분석과 동일하게 referrer는 origin만 사용해 인증 쿼리를 제외한다.
  const pageReferrer = document.referrer
    ? new URL(document.referrer).origin
    : ""

  const app = getFirebaseApp()
  if (app) {
    // Firebase Analytics가 gtag.js를 직접 로드한다. 수동 로더와 함께 쓰면 page_view가 두 번 찍힌다.
    // SDK는 넘긴 config 객체를 초기화 중 제자리에서 바꾸므로(firebase_origin·update·firebase_id)
    // 경로 변경마다 새 옵션으로 다시 부르면 analytics/already-initialized를 던진다. 한 번만 부른다.
    initializeAnalytics(app, { config: { page_referrer: pageReferrer } })
    firebaseAnalyticsInitialized = true
    return true
  }

  // ponytail: Firebase 환경변수가 배포에 들어가면 아래 수동 gtag 로더는 지운다.
  const dataLayer = (window.dataLayer ??= [])
  window.gtag = function () {
    dataLayer.push(arguments)
  }
  window.gtag("js", new Date())
  window.gtag("config", MEASUREMENT_ID, { page_referrer: pageReferrer })

  const script = document.createElement("script")
  script.id = SCRIPT_ID
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
  document.head.appendChild(script)
  return true
}
