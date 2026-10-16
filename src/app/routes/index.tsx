import { createFileRoute } from "@tanstack/react-router"
import { LandingPage } from "@/pages/landing/ui/LandingPage"

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pinnned | 친구와 함께 만드는 여행 기록 지도" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://www.pinnned.co.kr/" }],
  }),
  component: LandingPage,
})
