// 초대 링크 — 공유 버튼과 티켓 QR이 같은 주소를 쓴다.
// /pot-start가 ?inviteCode=를 읽어 로그인·참여 플로우로 보낸다 (pending-invite 참고).
export function inviteLinkFor(code: string): string {
  return `${window.location.origin}/pot-start?inviteCode=${encodeURIComponent(code)}`
}
