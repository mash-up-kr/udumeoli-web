import * as React from "react"

import { USE_MOCK, toggleMockMode } from "@/shared/api/client"

/** dev 전용 목/실서버 전환 버튼 — 프로덕션 빌드에선 렌더되지 않는다. */
export function MockToggle() {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!import.meta.env.DEV || !mounted) return null

  return (
    <button
      type="button"
      onClick={toggleMockMode}
      className="fixed bottom-3 left-3 z-50 rounded-full px-3 py-1.5 text-xs font-semibold text-white shadow-md"
      style={{ backgroundColor: USE_MOCK ? "#e8453a" : "#2f9e44" }}
    >
      {USE_MOCK ? "목 데이터" : "실서버"}
    </button>
  )
}
