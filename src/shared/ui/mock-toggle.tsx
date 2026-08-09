import * as React from "react"

import { USE_MOCK, toggleMockMode } from "@/shared/api/client"

const MOCK_COLOR = "#e8453a"
const REAL_COLOR = "#2f9e44"

/**
 * dev 전용 목/실서버 전환 스위치 — 프로덕션 빌드에선 렌더되지 않는다.
 * 흰 노브가 현재 모드 쪽(좌=목데이터, 우=실서버)에 있고,
 * 누르면 노브가 반대편으로 밀린 뒤 새로고침으로 전환된다.
 */
export function MockToggle() {
  const [mounted, setMounted] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!import.meta.env.DEV || !mounted) return null

  // 전환 애니메이션이 보이도록 노브를 먼저 밀고 잠깐 뒤에 새로고침한다
  const isMock = pending ? !USE_MOCK : USE_MOCK
  const handleToggle = () => {
    if (pending) return
    setPending(true)
    setTimeout(toggleMockMode, 250)
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={!isMock}
      aria-label="목데이터/실서버 전환"
      onClick={handleToggle}
      className="fixed bottom-3 left-3 z-50 grid w-24 grid-cols-2 rounded-full p-0.5 text-center text-[10px] font-semibold shadow-md transition-colors duration-200"
      style={{ backgroundColor: isMock ? MOCK_COLOR : REAL_COLOR }}
    >
      {/* 슬라이딩 노브 — 트랙 절반 크기, 현재 모드 쪽을 덮는다 */}
      <span
        aria-hidden
        className="absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: isMock ? "translateX(0)" : "translateX(100%)" }}
      />
      <span
        className="relative py-1 transition-colors duration-200"
        style={{ color: isMock ? MOCK_COLOR : "rgba(255, 255, 255, 0.75)" }}
      >
        목데이터
      </span>
      <span
        className="relative py-1 transition-colors duration-200"
        style={{ color: isMock ? "rgba(255, 255, 255, 0.75)" : REAL_COLOR }}
      >
        실서버
      </span>
    </button>
  )
}
