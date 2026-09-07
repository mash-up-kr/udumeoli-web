import { RegionAlbumCard } from "./RegionAlbumCard"
import type { MemberSlot } from "./RegionAlbumCard"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof RegionAlbumCard> = {
  component: RegionAlbumCard,
  title: "Pages/TravelAlbum/RegionAlbumCard",
  parameters: {
    docs: {
      description: {
        component:
          "여행 앨범 메인의 지역 카드 (시안 3065-14470). 자리는 팟 멤버 수만큼 항상 만들고, 좌측부터 가입 순으로 고정한다. 안 올린 멤버 자리는 점선 + zzZ.",
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof RegionAlbumCard>

const PHOTO = "https://placehold.co/160x160/79d5e6/ffffff.png"

/** recorded 자리 인덱스만 사진을 채운 6인팟 슬롯 */
function slots(total: number, recorded: Array<number>): Array<MemberSlot> {
  return Array.from({ length: total }, (_, index) => ({
    memberId: `user-${index + 1}`,
    thumbnailUrl: recorded.includes(index) ? PHOTO : null,
  }))
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md bg-bg-neutral-subtle p-4">{children}</div>
  )
}

/** 6인팟 4명 기록 — 미기록 자리가 사이사이에 남는다 (시안 목업 "창원") */
export const Partial: Story = {
  render: () => (
    <Frame>
      <RegionAlbumCard
        name="창원"
        slots={slots(6, [1, 2, 3, 5])}
        showAlert
        onClick={() => {}}
      />
    </Frame>
  ),
}

/** 6인팟 전원 기록 — Alert 없음 (시안 목업 "대전") */
export const AllRecorded: Story = {
  render: () => (
    <Frame>
      <RegionAlbumCard
        name="대전"
        slots={slots(6, [0, 1, 2, 3, 4, 5])}
        showAlert={false}
        onClick={() => {}}
      />
    </Frame>
  ),
}

/** 1인팟 — 자리가 하나뿐 */
export const Solo: Story = {
  render: () => (
    <Frame>
      <RegionAlbumCard
        name="강릉"
        slots={slots(1, [0])}
        showAlert={false}
        onClick={() => {}}
      />
    </Frame>
  ),
}
