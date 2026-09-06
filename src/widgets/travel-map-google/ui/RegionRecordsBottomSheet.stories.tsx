import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Dialog as DialogPrimitive } from "radix-ui"
import { OverlayProvider } from "overlay-kit"

import { RegionRecordsBottomSheet } from "./RegionRecordsBottomSheet"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { PotMember } from "@/entities/travel-pot"
import type { Photo } from "@/entities/photo"

import { usePotStore } from "@/entities/travel-pot"
import { useSessionStore } from "@/entities/user"

const meta: Meta<typeof RegionRecordsBottomSheet> = {
  component: RegionRecordsBottomSheet,
  title: "Widgets/RegionRecordsBottomSheet",
  parameters: { layout: "fullscreen" },
}
export default meta
type Story = StoryObj<typeof RegionRecordsBottomSheet>

const NAMES = ["정민", "유지", "현우", "서연", "지호", "민아"]

function makeMembers(count: number): Array<PotMember> {
  return NAMES.slice(0, count).map((nickname, index) => ({
    id: `user-${index + 1}`,
    nickname,
    profileImageUrl: null,
  }))
}

function makePhotos(count: number): Array<Photo> {
  return Array.from({ length: count }, (_, index) => ({
    id: `photo-${index + 1}`,
    region: "양양군",
    date: "2026-08-01",
    lat: 38.07,
    lng: 128.61,
    thumbnailUrl: "https://placehold.co/400x440/79d5e6/ffffff.png",
    uploaderId: `user-${index + 1}`,
    potId: "pot-1",
    keyword: index % 2 === 0 ? "DESSERT" : "FOOD",
    comment: "아르히게찍었즁?ㅋㅋㅋㅋㅋ",
  }))
}

function Frame({ members: count }: { members: number }) {
  useSessionStore.setState({
    currentUser: { id: "user-1", nickname: "정민", profileImageUrl: null },
    isAuthenticated: true,
  })
  const members = makeMembers(count)
  usePotStore.setState({
    pots: [{ id: "pot-1", name: "우두머리", inviteCode: "aaa111", members }],
    currentPotId: "pot-1",
  })
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return (
    <QueryClientProvider client={client}>
      <OverlayProvider>
        {/* BottomSheetTitle이 Radix DialogTitle이라 Dialog 컨텍스트가 필요하다 */}
        <DialogPrimitive.Root open modal={false}>
          <div
            data-sheet-probe
            className="relative h-dvh w-full max-w-md overflow-hidden bg-gradient-to-br from-blue-200 to-green-100"
          >
            <div className="pointer-events-none absolute inset-x-0 bottom-0">
              <RegionRecordsBottomSheet
                region="양양군"
                members={members}
                photos={makePhotos(count === 1 ? 1 : count - 1)}
                onClose={() => {}}
                onAddPhoto={() => {}}
              />
            </div>
          </div>
        </DialogPrimitive.Root>
      </OverlayProvider>
    </QueryClientProvider>
  )
}

export const One: Story = { render: () => <Frame members={1} /> }
export const Two: Story = { render: () => <Frame members={2} /> }
export const Four: Story = { render: () => <Frame members={4} /> }
export const Six: Story = { render: () => <Frame members={6} /> }
