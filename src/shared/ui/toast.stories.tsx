import { OverlayProvider } from "overlay-kit"

import { Button } from "./button"
import { showToast } from "./toast"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta = {
  title: "Overlays/Toast",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <OverlayProvider>
        <div className="relative h-32">
          <Story />
        </div>
      </OverlayProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "화면 하단에 잠깐 표시되는 알림. `showToast()` 명령형으로 호출. 기본 3초 후 자동 dismiss.",
      },
      story: { inline: false, height: "200px" },
    },
  },
}
export default meta
type Story = StoryObj

/** 타입별 토스트 4종. */
export const Types: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() =>
          showToast({ message: "저장되었습니다.", type: "success" })
        }
      >
        success
      </Button>
      <Button
        onClick={() =>
          showToast({ message: "오류가 발생했습니다.", type: "error" })
        }
      >
        error
      </Button>
      <Button
        onClick={() =>
          showToast({ message: "초대 코드를 확인하세요.", type: "info" })
        }
      >
        info
      </Button>
      <Button
        onClick={() =>
          showToast({ message: "입력값을 다시 확인하세요.", type: "warning" })
        }
      >
        warning
      </Button>
    </div>
  ),
}

/** duration 조절. 기본 3초, 여기선 5초. */
export const CustomDuration: Story = {
  render: () => (
    <Button
      onClick={() =>
        showToast({
          message: "5초 동안 표시됩니다.",
          type: "info",
          duration: 5000,
        })
      }
    >
      5초 토스트
    </Button>
  ),
}
