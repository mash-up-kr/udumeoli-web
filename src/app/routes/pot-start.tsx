import { createFileRoute } from "@tanstack/react-router"
import { PotStartPage } from "@/pages/pot-start/ui/PotStartPage"

export const Route = createFileRoute("/pot-start")({
  component: PotStartPage,
  // 초대링크(카톡 공유) 진입 — 코드를 pot-join 프리필로 넘긴다.
  // 반환 타입을 옵셔널로 명시해야 기존 navigate({ to: "/pot-start" }) 호출부에
  // search가 필수로 요구되지 않는다
  validateSearch: (search: Record<string, unknown>): { inviteCode?: string } =>
    typeof search.inviteCode === "string"
      ? { inviteCode: search.inviteCode }
      : {},
})
