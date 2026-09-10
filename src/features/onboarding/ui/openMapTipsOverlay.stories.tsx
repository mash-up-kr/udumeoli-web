import { OverlayProvider } from "overlay-kit"
import * as React from "react"

import { openMapTipsOverlay } from "./openMapTipsOverlay"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta = {
  title: "Features/Onboarding/MapTipsOverlay",
  parameters: { layout: "fullscreen" },
}
export default meta
type Story = StoryObj

/**
 * 지도 사용 안내 (시안 3065-19280). 딤 위로 로고가 그대로 보여야 한다.
 * 뒤에 깔린 체크 패턴은 지도 대역 — backdrop-blur가 먹는지 함께 본다.
 */
function Frame() {
  React.useEffect(() => {
    // 팟별 1회 노출 이력을 지워야 스토리를 다시 열 때도 뜬다
    localStorage.removeItem("photato-map-tips-seen-pots")
    openMapTipsOverlay({ potId: "pot-1", onStart: () => {} })
  }, [])

  return (
    <div
      className="relative h-[812px] w-[375px]"
      style={{
        backgroundImage:
          "repeating-conic-gradient(#79d5e6 0% 25%, #c8ecb0 0% 50%)",
        backgroundSize: "56px 56px",
      }}
    />
  )
}

export const Default: Story = {
  render: () => (
    <OverlayProvider>
      <Frame />
    </OverlayProvider>
  ),
}
