import { Button } from "./button"
import { Header } from "./header"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Header> = {
  component: Header,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "뒤로가기 · 타이틀 · 우측 액션, 세 슬롯을 필요한 조합으로 쓰는 상단 바. 타이틀은 항상 화면 중앙 기준.",
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Header>

export const Default: Story = {
  render: () => (
    <Header>
      <Header.Back />
      <Header.Title>타이틀</Header.Title>
    </Header>
  ),
}

export const Compositions: Story = {
  render: () => (
    <div className="flex flex-col divide-y">
      <Header>
        <Header.Title>타이틀만</Header.Title>
      </Header>
      <Header>
        <Header.Back />
        <Header.Title>뒤로가기 + 타이틀</Header.Title>
      </Header>
      <Header>
        <Header.Back />
        <Header.Title>뒤로가기 + 타이틀 + 우측 액션</Header.Title>
        <Header.Right>
          <Button variant="text" size="sm">
            완료
          </Button>
        </Header.Right>
      </Header>
      <Header>
        <Header.Back />
        <Header.Title>뒤로가기 + 타이틀 + 텍스트 액션</Header.Title>
        <Header.Right>
          <Button variant="text" size="sm" className="text-primary">
            + 추가
          </Button>
        </Header.Right>
      </Header>
      <Header>
        <Header.Back />
        <Header.Right>
          <Button variant="text" size="sm">
            건너뛰기
          </Button>
        </Header.Right>
      </Header>
    </div>
  ),
}
