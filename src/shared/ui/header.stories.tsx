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
        component:
          "뒤로가기 · 타이틀 · 우측 액션, 세 슬롯을 필요한 조합으로 쓰는 범용 상단 바. 타이틀은 좌측 정렬(시안 #17/#19 기준), padding 20 · gap 27. transparent prop으로 배경 투명 처리 가능.",
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Header>

/** 시안 #17/#19 — 뒤로가기 + 좌측 정렬 타이틀. */
export const Default: Story = {
  render: () => (
    <Header>
      <Header.Back />
      <Header.Title>여행팟 생성</Header.Title>
    </Header>
  ),
}

/** 배경 투명 — 지도·이미지 위에 올리는 헤더용. (체커보드는 투명 표시용 배경) */
export const Transparent: Story = {
  render: () => (
    <div className="bg-blue-200">
      <Header transparent>
        <Header.Back />
        <Header.Title>회원가입</Header.Title>
      </Header>
    </div>
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
