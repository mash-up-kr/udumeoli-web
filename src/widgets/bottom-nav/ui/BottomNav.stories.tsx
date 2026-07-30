import { BottomNav } from "./BottomNav"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof BottomNav> = {
  component: BottomNav,
  title: "Widgets/BottomNav",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "지도 메인 하단 내비게이션 (시안 1745-38063). 어두운 필 바 + 중앙 지구본, 좌측 여행 앨범 / 우측 마이페이지. 이동 동작은 페이지에서 주입.",
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof BottomNav>

/** 지도 위에 뜨는 요소라 지도 느낌의 backdrop 위에 배치. */
export const Default: Story = {
  render: () => (
    <div className="flex h-60 items-end justify-center bg-blue-200 pb-8">
      <BottomNav />
    </div>
  ),
}

/** 여행 앨범 페이지(시안 1846-3645) — 앨범 탭 활성, 지구본 클릭 시 지도로 이동. */
export const AlbumActive: Story = {
  render: () => (
    <div className="flex h-60 items-end justify-center bg-bg-neutral-subtle pb-8">
      <BottomNav active="album" onGlobeClick={() => {}} />
    </div>
  ),
}
