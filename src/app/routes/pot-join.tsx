import { createFileRoute } from "@tanstack/react-router"
import { PotJoinPage } from "@/pages/pot-join/ui/PotJoinPage"

// 초대 링크에서 넘어온 코드 — 영문+숫자 6자리 외 값은 무시하고 수동 입력 화면으로
const INVITE_CODE_PATTERN = /^[a-z0-9]{6}$/i

export const Route = createFileRoute("/pot-join")({
  validateSearch: (search): { inviteCode?: string } => {
    const code = search.inviteCode
    return typeof code === "string" && INVITE_CODE_PATTERN.test(code)
      ? { inviteCode: code }
      : {}
  },
  component: PotJoinRoute,
})

function PotJoinRoute() {
  const { inviteCode } = Route.useSearch()
  return <PotJoinPage initialCode={inviteCode} />
}
