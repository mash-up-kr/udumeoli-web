import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { useRecordStore } from "../model/record.store"
import { TravelRecordFlow } from "./TravelRecordFlow"
import type { RecordStep } from "../model/record.store"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { usePotStore } from "@/entities/travel-pot"
import { useSessionStore } from "@/entities/user"

const meta: Meta<typeof TravelRecordFlow> = {
  component: TravelRecordFlow,
  title: "Features/TravelRecordFlow",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "여행 기록 플로우 (Figma 1836-15911) — 기간 → 키워드 → 사진·코멘트 → 최종 확인. 지도 위 오버레이라 실제로는 지도가 배경에 깔린다.",
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof TravelRecordFlow>

// 스토리에서 지도 없이 단독 렌더 — 플로우가 쓰는 스토어/Query만 최소로 채운다
function setup(step: RecordStep) {
  useSessionStore.setState({
    currentUser: { id: "user-1", nickname: "정민", profileImageUrl: null },
    isAuthenticated: true,
  })
  usePotStore.setState({
    pots: [
      {
        id: "pot-1",
        name: "우두머리",
        inviteCode: "aaa111",
        members: [{ id: "user-1", nickname: "정민", profileImageUrl: null }],
      },
    ],
    currentPotId: "pot-1",
  })
  useRecordStore.setState({ region: "강릉시", step, preview: null })
}

function Frame({ step }: { step: RecordStep }) {
  setup(step)
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return (
    <QueryClientProvider client={client}>
      {/* 지도 대신 하늘색 배경 — 오버레이의 blur·그라디언트가 어떻게 보이는지 확인용 */}
      <div className="relative h-dvh w-full max-w-md bg-gradient-to-br from-blue-200 to-green-100">
        <TravelRecordFlow
          region="강릉시"
          center={{ lat: 37.75, lng: 128.87 }}
        />
      </div>
    </QueryClientProvider>
  )
}

/** 1단계 — 다녀온 기간 선택 (Figma 1836-15777) */
export const DateSelect: Story = { render: () => <Frame step="date" /> }

/**
 * 2단계 — 여행 대표 키워드 선택 (Figma 1836-16473).
 * 키워드를 고르고 확인을 누르면 3단계(사진·코멘트)까지 이어서 볼 수 있다.
 */
export const KeywordSelect: Story = { render: () => <Frame step="keyword" /> }
