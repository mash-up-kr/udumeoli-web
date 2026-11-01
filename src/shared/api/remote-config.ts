import * as React from "react"
import {
  fetchAndActivate,
  getRemoteConfig,
  getValue,
} from "firebase/remote-config"
import { getFirebaseApp } from "./firebase"
import type { RemoteConfig } from "firebase/remote-config"

// 실험 값 변경이 한 시간 안에 반영되도록 SDK 기본값(12시간)보다 짧게 둔다. 호출량이 문제되면 늘린다.
const MINIMUM_FETCH_INTERVAL_MS = 60 * 60 * 1000
const FETCH_TIMEOUT_MS = 5_000

let remoteConfig: RemoteConfig | null = null
let settled = false
const listeners = new Set<() => void>()

function notify(): void {
  settled = true
  listeners.forEach((listener) => listener())
}

/**
 * 앱 시작 시 한 번 호출한다. Analytics 초기화 뒤에 불러야 실험 배정이 Analytics 사용자 속성에 기록된다.
 * 설정이 없거나 조회가 실패하면 기본값으로 계속 동작한다.
 */
export function initializeRemoteConfig(): void {
  if (remoteConfig) return
  const app = getFirebaseApp()
  if (!app) return

  remoteConfig = getRemoteConfig(app)
  remoteConfig.settings.minimumFetchIntervalMillis = MINIMUM_FETCH_INTERVAL_MS
  remoteConfig.settings.fetchTimeoutMillis = FETCH_TIMEOUT_MS
  fetchAndActivate(remoteConfig)
    .catch(() => {
      // 실험 값 조회 실패는 서비스 동작에 영향을 주면 안 된다. 직전에 활성화된 값 또는 기본값을 쓴다.
    })
    .finally(notify)
}

/** 원격에서 받은 값만 돌려준다. 미설정·조회 전·키 없음은 모두 기본값이다. */
export function getRemoteConfigValue(
  key: string,
  defaultValue: string
): string {
  if (!remoteConfig || !settled) return defaultValue
  const value = getValue(remoteConfig, key)
  return value.getSource() === "remote" ? value.asString() : defaultValue
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** 서버 렌더와 하이드레이션은 기본값, Remote Config 활성화 후 원격 값으로 다시 렌더된다. */
export function useRemoteConfigValue(
  key: string,
  defaultValue: string
): string {
  return React.useSyncExternalStore(
    subscribe,
    () => getRemoteConfigValue(key, defaultValue),
    () => defaultValue
  )
}
