import { ImageCardPattern } from "./image-card-pattern"
import type { ImageCardPatternItem } from "./image-card-pattern"
import type { Meta, StoryObj } from "@storybook/react-vite"
import sampleImageSrc from "@/shared/assets/sample.jpeg"

const items: Array<ImageCardPatternItem> = [
  { id: "1", src: sampleImageSrc, title: "강릉", subtitle: "3days" },
  { id: "2", src: sampleImageSrc, title: "대전", subtitle: "3days" },
  { id: "3", src: sampleImageSrc, title: "부산", subtitle: "2days" },
  { id: "4", src: sampleImageSrc, title: "서울", subtitle: "1day" },
  { id: "5", src: sampleImageSrc, title: "제주", subtitle: "4days" },
]

const meta: Meta<typeof ImageCardPattern> = {
  component: ImageCardPattern,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "피그마 #940-3108 — ImageCard를 원 궤적 위에 배치한 가로 스크롤 캐러셀. 좌우로 드래그하면 카드가 원을 따라 돌며 중앙 카드가 커진다. 사이드 카드를 탭하면 중앙으로 스냅되고, 중앙 카드를 탭해야 onItemClick이 호출된다.",
      },
    },
  },
  args: { items },
  decorators: [
    (Story) => (
      <div className="w-[375px]">
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof ImageCardPattern>

export const Default: Story = {}

/** 중앙 카드 탭 시 onItemClick 호출, 사이드 카드 탭 시 중앙 스냅. */
export const Clickable: Story = {
  args: {
    onItemClick: (item) => alert(`${item.title} ${item.subtitle ?? ""}`),
  },
}
