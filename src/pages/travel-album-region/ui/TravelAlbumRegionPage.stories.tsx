import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router"

import { TravelAlbumRegionPage } from "./TravelAlbumRegionPage"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { Photo } from "@/entities/photo"

import { photoKeys } from "@/entities/photo"
import { usePotStore } from "@/entities/travel-pot"
import { useSessionStore } from "@/entities/user"

const meta: Meta<typeof TravelAlbumRegionPage> = {
  component: TravelAlbumRegionPage,
  title: "Pages/TravelAlbumRegion/TravelAlbumRegionPage",
  parameters: { layout: "fullscreen" },
}
export default meta
type Story = StoryObj<typeof TravelAlbumRegionPage>

const REGION = "창원시"
const NAMES = ["유지", "정민", "현우", "서연"]

function photo(index: number, uploaderId: string): Photo {
  return {
    id: `photo-${index}`,
    region: REGION,
    date: `2026-08-0${index}`,
    lat: 35.22,
    lng: 128.68,
    thumbnailUrl: "https://placehold.co/400x440/79d5e6/ffffff.png",
    uploaderId,
    potId: "pot-1",
    keyword: index % 2 === 0 ? "DESSERT" : "PHOTO",
    comment: "야르하게찍었쥬?ㅋㅋㅋㅋㅋㅋㅋㅋㅋ",
  }
}

/** 시안 3065-14507(4인) · 3212-66144(1인) — 팟 인원과 기록 수만 다르다 */
function Frame({ members = 4 }: { members?: number }) {
  useSessionStore.setState({
    currentUser: { id: "user-1", nickname: "유지", profileImageUrl: null },
    isAuthenticated: true,
  })
  usePotStore.setState({
    pots: [
      {
        id: "pot-1",
        name: "우두머리",
        inviteCode: "aaa111",
        members: NAMES.slice(0, members).map((nickname, index) => ({
          id: `user-${index + 1}`,
          nickname,
          profileImageUrl: null,
        })),
      },
    ],
    currentPotId: "pot-1",
  })
  // RequireAuth가 me 조회 실패로 로그아웃시키지 않게 refresh 토큰을 심는다
  localStorage.setItem("udumeoli:refresh-token", "storybook")

  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  client.setQueryData(
    photoKeys.list("pot-1"),
    members === 1
      ? [photo(1, "user-1")]
      : [
          photo(1, "user-2"),
          photo(2, "user-2"),
          photo(3, "user-3"),
          photo(4, "user-3"),
        ]
  )

  const rootRoute = createRootRoute({
    component: () => <TravelAlbumRegionPage region={REGION} />,
  })
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  })

  return (
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

export const Case3: Story = { render: () => <Frame /> }
export const Single: Story = { render: () => <Frame members={1} /> }
