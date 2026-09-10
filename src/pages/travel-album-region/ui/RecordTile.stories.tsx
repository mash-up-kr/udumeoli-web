import { RecordTile } from "./RecordTile"
import type { RecordMember } from "./RecordTile"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { Photo } from "@/entities/photo"

const meta: Meta<typeof RecordTile> = {
  component: RecordTile,
  title: "Pages/TravelAlbumRegion/RecordTile",
  parameters: { layout: "fullscreen" },
}
export default meta
type Story = StoryObj<typeof RecordTile>

function member(nickname: string, isMe: boolean): RecordMember {
  return { memberId: nickname, nickname, profileImageUrl: null, isMe }
}

const PHOTO: Photo = {
  id: "photo-1",
  region: "창원시",
  date: "2026-08-01",
  lat: 35.22,
  lng: 128.68,
  thumbnailUrl: "https://placehold.co/400x440/79d5e6/ffffff.png",
  uploaderId: "정민",
  potId: "pot-1",
  keyword: "DESSERT",
  comment: "야르하게찍었쥬?ㅋㅋㅋㅋㅋㅋㅋㅋㅋ",
}

/** 시안 3065-14507과 같은 2열 그리드 — 내 빈 타일·남의 빈 타일·사진 타일 */
function Grid() {
  return (
    <div className="w-[375px] bg-bg-neutral-subtle">
      <div className="grid grid-cols-2 gap-3 px-4 py-4">
        <RecordTile
          member={member("유지", true)}
          photo={null}
          onRecord={() => {}}
          onPhotoClick={() => {}}
        />
        <RecordTile
          member={member("정민", false)}
          photo={null}
          onRecord={() => {}}
          onPhotoClick={() => {}}
        />
        <RecordTile
          member={member("정민", false)}
          photo={PHOTO}
          onRecord={() => {}}
          onPhotoClick={() => {}}
        />
        <RecordTile
          member={member("유지", true)}
          photo={PHOTO}
          onRecord={() => {}}
          onPhotoClick={() => {}}
        />
      </div>
    </div>
  )
}

export const TwoColumn: Story = { render: () => <Grid /> }
