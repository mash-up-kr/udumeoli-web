import { LogoStickerCluster } from "./logo-sticker-cluster"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof LogoStickerCluster> = {
  component: LogoStickerCluster,
  parameters: {
    docs: {
      description: {
        component:
          "아웃라인 워드마크 + 키워드 스티커 클러스터 (Figma 2632-37319·2632-37293 공용). 스플래시·랜딩이 같은 그래픽을 공유한다.",
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof LogoStickerCluster>

export const Default: Story = {}

export const LogoPulse: Story = {
  args: { logoPulse: true },
}
