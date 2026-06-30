import { LinkList } from "./link-list"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof LinkList> = {
  component: LinkList,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[375px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "섹션 헤더·링크 아이템·정보 행 3가지 타입을 조합하는 리스트. 설정·마이 페이지 메뉴에 사용.",
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof LinkList>

/** 피그마 '정보' 섹션 전체 구성. */
export const Default: Story = {
  args: {
    items: [
      { type: "header", label: "정보" },
      { type: "link", label: "1:1 문의", onClick: () => {} },
      { type: "link", label: "이용약관", onClick: () => {} },
      { type: "link", label: "개인정보처리방침", onClick: () => {} },
      { type: "info", label: "버전 정보", value: "v 1.0.0" },
    ],
  },
}

/** 링크 아이템만. */
export const LinksOnly: Story = {
  args: {
    items: [
      { type: "link", label: "이용약관", onClick: () => {} },
      { type: "link", label: "개인정보처리방침", onClick: () => {} },
    ],
  },
}
