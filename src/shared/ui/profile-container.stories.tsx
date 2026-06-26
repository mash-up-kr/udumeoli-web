import { ProfileContainer } from "./profile-container"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof ProfileContainer> = {
  component: ProfileContainer,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "프로필 이미지 원형 컨테이너. 이미지 없으면 이름 앞 2자 fallback. `onEdit` 있으면 우측 하단 카메라 버튼 노출.",
      },
    },
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
      description: "크기. sm(48) · md(80) · lg(100)",
    },
    src: { control: "text", description: "프로필 이미지 URL." },
    name: { control: "text", description: "이름. 이미지 없을 때 앞 2자 표시." },
  },
  args: {
    src: "/sample.jpeg",
    name: "홍길동",
    size: "md",
  },
}
export default meta
type Story = StoryObj<typeof ProfileContainer>

export const Default: Story = {}

/** 사이즈 3종. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <ProfileContainer src="/sample.jpeg" name="홍길동" size="sm" />
      <ProfileContainer src="/sample.jpeg" name="홍길동" size="md" />
      <ProfileContainer src="/sample.jpeg" name="홍길동" size="lg" />
    </div>
  ),
}

/** 이미지 없음 — 이름 앞 2자 fallback. */
export const Fallback: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <ProfileContainer name="홍길동" size="sm" />
      <ProfileContainer name="홍길동" size="md" />
      <ProfileContainer name="홍길동" size="lg" />
    </div>
  ),
}

/** 피그마 #576-2350 — 우측 하단 카메라 편집 버튼. */
export const WithEditButton: Story = {
  args: { onEdit: () => alert("편집") },
}
