import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { TravelMapGoogle } from "./TravelMapGoogle"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof TravelMapGoogle> = {
  component: TravelMapGoogle,
  title: "Widgets/TravelMapGoogle",
  parameters: { layout: "fullscreen" },
}
export default meta
type Story = StoryObj<typeof TravelMapGoogle>

/**
 * 지도 로딩 오버레이 (시안 3065-19357 · 3065-19371 · 애니메이션 3065-20993).
 * 스토리북엔 Google Maps 키가 없어 타일이 준비되지 않으므로 오버레이가 계속 떠 있다.
 * 뒤에 깔린 체크 패턴은 backdrop-blur가 실제로 먹는지 보려고 둔 것 — 실제로는 지도가 온다.
 */
export const Loading: Story = {
  render: () => (
    <QueryClientProvider client={new QueryClient()}>
      <div
        className="relative h-[812px] w-[375px]"
        style={{
          backgroundImage:
            "repeating-conic-gradient(#79d5e6 0% 25%, #c8ecb0 0% 50%)",
          backgroundSize: "56px 56px",
        }}
      >
        <TravelMapGoogle className="absolute inset-0" />
      </div>
    </QueryClientProvider>
  ),
}
