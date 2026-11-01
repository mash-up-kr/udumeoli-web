import { createFileRoute, redirect } from "@tanstack/react-router"

// 티켓 QR 전용 짧은 초대 주소 (/i/<코드>). 긴 /pot-start?inviteCode= 보다 QR 격자가 작아져 선명하다.
// QR에는 대문자(/I/CODE)로 담기므로 라우트 매칭은 기본값(대소문자 무관)에 맡기고, 코드는 소문자로 정규화해 넘긴다
// (참여 화면 입력도 소문자로 정규화한다 — PotJoinPage).
export const Route = createFileRoute("/i/$code")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/pot-start",
      search: { inviteCode: params.code.toLowerCase() },
      replace: true,
    })
  },
})
