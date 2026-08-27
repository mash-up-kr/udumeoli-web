import { createFileRoute } from "@tanstack/react-router"
import { PotStartPage } from "@/pages/pot-start/ui/PotStartPage"

// 초대 링크(/pot-start?inviteCode=xxx) 코드 — 영문+숫자 6자리 외 값은 무시하고 일반 진입
const INVITE_CODE_PATTERN = /^[a-z0-9]{6}$/i

export const Route = createFileRoute("/pot-start")({
  validateSearch: (search): { inviteCode?: string } => {
    const code = search.inviteCode
    return typeof code === "string" && INVITE_CODE_PATTERN.test(code)
      ? { inviteCode: code }
      : {}
  },
  component: PotStartRoute,
})

function PotStartRoute() {
  const { inviteCode } = Route.useSearch()
  return <PotStartPage inviteCode={inviteCode} />
}
