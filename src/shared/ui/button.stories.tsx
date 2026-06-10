import { Button } from "./button"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ["autodocs"],
  args: { children: "버튼" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "destructive", "link", "kakao"],
      description: "버튼 스타일.",
    },
    size: {
      control: "select",
      options: ["xs", "sm", "default", "lg", "xl", "icon", "icon-xs", "icon-sm", "icon-lg"],
      description: "버튼 크기. xl은 하단 전체 너비 CTA용.",
    },
    disabled: {
      control: "boolean",
      description: "클릭 불가 상태.",
    },
  },
}
export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="default">기본</Button>
      <Button variant="outline">아웃라인</Button>
      <Button variant="secondary">보조</Button>
      <Button variant="ghost">고스트</Button>
      <Button variant="destructive">삭제</Button>
      <Button variant="kakao">카카오로 시작하기</Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="xs">xs</Button>
      <Button size="sm">sm</Button>
      <Button size="default">default</Button>
      <Button size="lg">lg</Button>
      <Button size="xl">xl</Button>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>기본</Button>
      <Button disabled>비활성화</Button>
    </div>
  ),
}

export const FullWidthCTA: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Button size="xl" className="w-full rounded-full">
        저장
      </Button>
      <Button size="xl" variant="kakao" className="w-full rounded-full">
        카카오로 시작하기
      </Button>
      <Button size="xl" variant="outline" className="w-full rounded-full">
        취소
      </Button>
    </div>
  ),
}
