import type { Meta, StoryObj } from "@storybook/react-vite"

import iconAlertSrc from "@/shared/assets/icon-alert.svg"
import iconAlertDangerSrc from "@/shared/assets/icon-alert-danger.svg"
import iconArrowLeftSrc from "@/shared/assets/icon-arrow-left.svg"
import iconCameraSrc from "@/shared/assets/icon-camera.svg"
import iconCameraAddSrc from "@/shared/assets/icon-camera-add.svg"
import iconCheckSrc from "@/shared/assets/icon-check.svg"
import iconCheckCircleSrc from "@/shared/assets/icon-check-circle.svg"
import iconChevronDownSrc from "@/shared/assets/icon-chevron-down.svg"
import iconChevronRightSrc from "@/shared/assets/icon-chevron-right.svg"
import iconCloseSrc from "@/shared/assets/icon-close.svg"
import iconCloseBoldSrc from "@/shared/assets/icon-close-bold.svg"
import iconKakaoSrc from "@/shared/assets/icon-kakao.svg"
import iconKakaotalkSrc from "@/shared/assets/icon-kakaotalk.svg"
import iconZoomInoutSrc from "@/shared/assets/icon-zoom-inout.svg"

const meta: Meta = {
  title: "Foundations/Icon",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "shared/assets 아이콘 에셋 모음 (Figma Icon v1.0.0). 24×24 기준, 색은 SVG에 포함.",
      },
    },
  },
}
export default meta
type Story = StoryObj

const ICONS: Array<{ name: string; src: string }> = [
  { name: "icon-alert", src: iconAlertSrc },
  { name: "icon-alert-danger", src: iconAlertDangerSrc },
  { name: "icon-arrow-left", src: iconArrowLeftSrc },
  { name: "icon-camera", src: iconCameraSrc },
  { name: "icon-camera-add", src: iconCameraAddSrc },
  { name: "icon-check", src: iconCheckSrc },
  { name: "icon-check-circle", src: iconCheckCircleSrc },
  { name: "icon-chevron-down", src: iconChevronDownSrc },
  { name: "icon-chevron-right", src: iconChevronRightSrc },
  { name: "icon-close", src: iconCloseSrc },
  { name: "icon-close-bold", src: iconCloseBoldSrc },
  { name: "icon-kakao", src: iconKakaoSrc },
  { name: "icon-kakaotalk", src: iconKakaotalkSrc },
  { name: "icon-zoom-inout", src: iconZoomInoutSrc },
]

export const Gallery: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {ICONS.map(({ name, src }) => (
        <div
          key={name}
          className="flex w-28 flex-col items-center gap-2 rounded-md border border-border p-3"
        >
          <img src={src} alt={name} className="size-6" />
          <span className="text-center text-b8 break-all text-muted-foreground">
            {name}
          </span>
        </div>
      ))}
    </div>
  ),
}
