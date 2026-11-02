import { getApp, getApps, initializeApp } from "firebase/app"
import type { FirebaseApp } from "firebase/app"

interface FirebaseEnv {
  apiKey: string
  projectId: string
  appId: string
  measurementId?: string
}

/** Firebase 콘솔 > 프로젝트 설정 > 내 앱(웹)의 SDK 설정값. 하나라도 없으면 Firebase를 쓰지 않는다. */
function firebaseEnv(): FirebaseEnv | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as
    | string
    | undefined
  const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined
  if (!apiKey || !projectId || !appId) return null

  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as
    | string
    | undefined
  return measurementId
    ? { apiKey, projectId, appId, measurementId }
    : { apiKey, projectId, appId }
}

/** 브라우저에서 환경변수가 갖춰졌을 때만 앱을 만든다. null이면 호출부는 Firebase 없이 동작해야 한다. */
export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null
  const env = firebaseEnv()
  if (!env) return null
  return getApps().length > 0 ? getApp() : initializeApp(env)
}
