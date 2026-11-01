// 초대 링크 — 공유 버튼이 쓰는 주소. /pot-start가 ?inviteCode=를 읽어 로그인·참여 플로우로 보낸다 (pending-invite 참고).
export function inviteLinkFor(code: string): string {
  return `${window.location.origin}/pot-start?inviteCode=${encodeURIComponent(code)}`
}

// 티켓 QR에 담는 주소 — 같은 팟으로 가지만 짧은 /i/<코드> 라우트를 쓰고 전부 대문자로 만든다.
// 대문자·숫자·:/.-만 있으면 QR이 영숫자 모드로 압축돼 25×25 격자에 들어간다 (일반 링크는 33×33).
// 같은 64px 박스에서 셀이 커져 선명해진다. 스킴·호스트는 대소문자 무관, 경로는 /i 라우트가 소문자로 정규화한다.
export function inviteQrValueFor(code: string): string {
  return `${window.location.origin}/i/${code}`.toUpperCase()
}
