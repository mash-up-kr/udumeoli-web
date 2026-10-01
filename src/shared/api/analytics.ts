const ANONYMOUS_ID_KEY = "udumeoli:analytics:anonymous-id"
const SESSION_ID_KEY = "udumeoli:analytics:session-id"
const SESSION_STARTED_KEY = "udumeoli:analytics:session-started"
const REQUEST_TIMEOUT_MS = 3_000

let fallbackAnonymousId: string | null = null
let fallbackSessionId: string | null = null
let fallbackSessionStarted = false

export interface AnalyticsMetadata {
  [key: string]: string | number | boolean | null
}

export interface TrackEventData {
  metadata?: AnalyticsMetadata
}

interface AnalyticsPayload {
  eventId: string
  eventName: string
  occurredAt: string
  anonymousId: string
  sessionId: string
  path: string
  referrer: string
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  userAgent: string
  deviceType: "mobile" | "desktop"
  metadata: AnalyticsMetadata
}

function createId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID()
    }
  } catch {
    // Fall through to the non-cryptographic browser fallback.
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function getStorage(kind: "localStorage" | "sessionStorage"): Storage | null {
  if (typeof window === "undefined") return null
  try {
    return window[kind]
  } catch {
    return null
  }
}

function getOrCreateId(
  kind: "localStorage" | "sessionStorage",
  key: string,
  fallback: { value: string | null }
): string {
  const storage = getStorage(kind)
  if (storage) {
    try {
      const existing = storage.getItem(key)
      if (existing) return existing
      const id = createId()
      storage.setItem(key, id)
      return id
    } catch {
      // Storage may be disabled or full. Continue with an in-memory ID.
    }
  }

  fallback.value ??= createId()
  return fallback.value
}

function getAnonymousId(): string {
  return getOrCreateId("localStorage", ANONYMOUS_ID_KEY, {
    get value() {
      return fallbackAnonymousId
    },
    set value(value: string | null) {
      fallbackAnonymousId = value
    },
  })
}

function getSessionId(): string {
  return getOrCreateId("sessionStorage", SESSION_ID_KEY, {
    get value() {
      return fallbackSessionId
    },
    set value(value: string | null) {
      fallbackSessionId = value
    },
  })
}

function currentContext(): Omit<
  AnalyticsPayload,
  "eventId" | "eventName" | "occurredAt" | "metadata"
> {
  if (typeof window === "undefined") {
    return {
      anonymousId: "server",
      sessionId: "server",
      path: "",
      referrer: "",
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      userAgent: "",
      deviceType: "desktop",
    }
  }

  const params = new URLSearchParams(window.location.search)
  return {
    anonymousId: getAnonymousId(),
    sessionId: getSessionId(),
    path: window.location.pathname,
    referrer: document.referrer,
    utmSource: params.get("utm_source"),
    utmMedium: params.get("utm_medium"),
    utmCampaign: params.get("utm_campaign"),
    userAgent: navigator.userAgent,
    deviceType: /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
      ? "mobile"
      : "desktop",
  }
}

function hasStartedSession(): boolean {
  const storage = getStorage("sessionStorage")
  if (!storage) return fallbackSessionStarted
  try {
    return storage.getItem(SESSION_STARTED_KEY) === "true"
  } catch {
    return fallbackSessionStarted
  }
}

function markSessionStarted(): void {
  fallbackSessionStarted = true
  const storage = getStorage("sessionStorage")
  try {
    storage?.setItem(SESSION_STARTED_KEY, "true")
  } catch {
    // Analytics state must never affect the application.
  }
}

function analyticsUrl(): string {
  return (
    import.meta.env.VITE_ANALYTICS_API_URL as string | undefined
  )?.replace(/\/$/, "")
    ? `${(import.meta.env.VITE_ANALYTICS_API_URL as string).replace(/\/$/, "")}/api/events`
    : ""
}

async function send(payload: AnalyticsPayload): Promise<void> {
  const url = analyticsUrl()
  if (!url) return

  const controller = new AbortController()
  const timeout = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS
  )
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
      keepalive: true,
    })
  } catch {
    // Analytics is best-effort and must not affect product functionality.
  } finally {
    window.clearTimeout(timeout)
  }
}

function buildPayload(
  eventName: string,
  metadata: AnalyticsMetadata = {}
): AnalyticsPayload {
  return {
    eventId: createId(),
    eventName,
    occurredAt: new Date().toISOString(),
    ...currentContext(),
    metadata,
  }
}

/** Fire-and-forget analytics event. It never rejects or blocks the caller. */
export function trackEvent(eventName: string, data: TrackEventData = {}): void {
  if (typeof window === "undefined") return

  const metadata = data.metadata ?? {}
  if (!hasStartedSession()) {
    markSessionStarted()
    void send(buildPayload("session_started"))
  }
  void send(buildPayload(eventName, metadata))
}
