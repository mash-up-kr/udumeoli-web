import { OverlayProvider } from "overlay-kit"
import { Button } from "./button"
import { copyText } from "./copy-text"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta = {
  title: "Shared/CopyText",
  decorators: [
    (Story) => (
      <OverlayProvider>
        <Story />
      </OverlayProvider>
    ),
  ],
}
export default meta

export const InviteCode: StoryObj = {
  render: () => (
    <Button onClick={() => void copyText("abc123", "초대코드가 복사됐어요")}>
      초대코드 복사 (권한 거절 시 수동 복사)
    </Button>
  ),
}
