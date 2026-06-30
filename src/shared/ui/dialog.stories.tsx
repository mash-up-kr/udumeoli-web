import { OverlayProvider, overlay } from "overlay-kit"

import { Button } from "./button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Dialog> = {
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "화면 위에 떠오르는 팝업. 안내 메시지, 권한 요청, 완료 알림 등에 사용.",
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Dialog>

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>다이얼로그 열기</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>제목</DialogTitle>
          <DialogDescription>내용이 여기 들어갑니다.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button className="w-full">확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const WithCloseButton: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>닫기 버튼 포함</Button>
      </DialogTrigger>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>접근 권한 확인</DialogTitle>
          <DialogDescription>
            편리한 앱 이용을 위해 접근 권한을 허용해주세요.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button className="w-full">확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

function ImperativeExample() {
  function handleOpen() {
    overlay.open(({ isOpen, close, unmount }) => (
      <Dialog open={isOpen} onOpenChange={(v) => !v && close()}>
        <DialogContent onCloseAutoFocus={() => unmount()}>
          <DialogHeader>
            <DialogTitle>overlay.open() 방식</DialogTitle>
            <DialogDescription>
              overlay-kit을 사용한 명령형 다이얼로그입니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="w-full" onClick={close}>
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ))
  }

  return <Button onClick={handleOpen}>overlay.open()으로 열기</Button>
}

export const Imperative: Story = {
  decorators: [
    (Story) => (
      <OverlayProvider>
        <Story />
      </OverlayProvider>
    ),
  ],
  parameters: { docs: { story: { inline: false, height: "400px" } } },
  render: () => <ImperativeExample />,
}
