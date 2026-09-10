import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router"

import { PotSelector } from "./PotSelector"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { usePotStore } from "@/entities/travel-pot"
import { useSessionStore } from "@/entities/user"

const meta: Meta<typeof PotSelector> = {
  component: PotSelector,
  title: "Widgets/PotDropdown/PotSelector",
  parameters: { layout: "fullscreen" },
}
export default meta
type Story = StoryObj<typeof PotSelector>

const ME = { id: "user-1", nickname: "유지", profileImageUrl: null }

/** 시안 3065-16354의 팟 이름 그대로 — 잘림(ellipsis)까지 대조하려고 긴 이름을 섞었다. */
const NAMES = ["우두머리", "민지 ❤️ 성준 영원히 함께하자하자하", "매쉬업"]

function Frame({ potCount = NAMES.length }: { potCount?: number }) {
  useSessionStore.setState({ currentUser: ME, isAuthenticated: true })
  usePotStore.setState({
    pots: NAMES.slice(0, potCount).map((name, index) => ({
      id: `pot-${index + 1}`,
      name,
      inviteCode: `code${index + 1}`,
      members: [ME],
    })),
    currentPotId: "pot-1",
  })

  const rootRoute = createRootRoute({
    // 트리거는 헤더 우측에 놓이고 드롭다운은 right-0 정렬이라 우측 정렬 컨테이너에 담는다
    component: () => (
      <div className="flex h-[420px] justify-end bg-bg-neutral-subtle px-4 pt-2">
        <PotSelector />
      </div>
    ),
  })
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  })

  return <RouterProvider router={router} />
}

/** 참여 중인 팟이 있는 기본 상태 — 여행팟 / 여행팟 추가 두 카드 (시안 3065-16684). */
export const Default: Story = { render: () => <Frame /> }

/** 신규 유저 — 팟이 없으면 여행팟 카드가 통째로 빠지고 추가 카드만 남는다. */
export const NoPots: Story = { render: () => <Frame potCount={0} /> }
