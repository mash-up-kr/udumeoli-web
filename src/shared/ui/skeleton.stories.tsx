import { Skeleton } from "./skeleton"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Skeleton> = {
  component: Skeleton,
  tags: ["autodocs"],
  args: {
    className: "h-6 w-40",
  },
  parameters: {
    docs: {
      description: {
        component:
          "로딩 중 실제 콘텐츠의 형태를 미리 잡아두는 기본 스켈레톤 블록입니다. 크기와 모양은 className으로 조합합니다.",
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Skeleton>

export const Playground: Story = {}

export const Shapes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="size-14 rounded-full" />
      <Skeleton className="h-24 w-40 rounded-[24px]" />
    </div>
  ),
}

export const TextBlock: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Skeleton className="h-5 w-3/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  ),
}

export const Card: Story = {
  render: () => (
    <div className="flex w-[343px] gap-4 rounded-[24px] border border-stroke-neutral-weak bg-bg-neutral-weak p-4">
      <Skeleton className="size-14 rounded-full" />
      <div className="flex flex-1 flex-col justify-center gap-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  ),
}
