import { PreviewStep } from "./PreviewStep"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { TRAVEL_KEYWORD_OPTIONS } from "@/entities/photo"

const meta: Meta<typeof PreviewStep> = {
  component: PreviewStep,
  title: "Features/TravelRecordFlow/PreviewStep",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "기록 최종 확인 (Figma 1836-15652) — 지도에 올리기 전 미리보기. 키워드 스티커가 배경에 흩뿌려지고 대표 사진에 닉네임·코멘트가 얹힌다.",
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof PreviewStep>

const firstKeyword = TRAVEL_KEYWORD_OPTIONS[0]

/** 기간 여행 + 코멘트 있음 (시안 케이스) */
export const Default: Story = {
  render: () => (
    <div className="relative h-dvh w-full max-w-md bg-gradient-to-br from-blue-200 to-green-100">
      <PreviewStep
        keyword={firstKeyword}
        startDate="2026-08-01"
        endDate="2026-08-02"
        photoUrl="https://picsum.photos/seed/record-preview/600/800"
        comment="야르하게찍었쥬?ㅋㅋ"
        nickname="정민"
        profileImageUrl={null}
        onBack={() => {}}
        onConfirm={() => {}}
      />
    </div>
  ),
}

/** 당일 여행 + 코멘트 없음 — 말풍선이 빠져도 레이아웃이 유지되는지 확인 */
export const SingleDayNoComment: Story = {
  render: () => (
    <div className="relative h-dvh w-full max-w-md bg-gradient-to-br from-blue-200 to-green-100">
      <PreviewStep
        keyword={TRAVEL_KEYWORD_OPTIONS[4]}
        startDate="2026-08-01"
        photoUrl="https://picsum.photos/seed/record-preview-2/600/800"
        comment=""
        nickname="아주긴닉네임입니다"
        profileImageUrl={null}
        onBack={() => {}}
        onConfirm={() => {}}
      />
    </div>
  ),
}
