// 초대링크(/pot-start?inviteCode=...)로 진입한 뒤 카카오 로그인·가입 리다이렉트를
// 거치는 동안 초대코드를 유지하는 저장소. pot-join 화면이 소비(take)한다.
// sessionStorage — 탭 단위라 다른 탭·다음 방문의 로그인 흐름을 오염시키지 않는다.
const PENDING_INVITE_KEY = "udumeoli:pending-invite-code"

// SSR에선 window가 없다 — 초대코드 저장·소비는 전부 클라이언트에서만 일어난다
function storage(): Storage | null {
  return typeof window === "undefined" ? null : window.sessionStorage
}

export function setPendingInviteCode(code: string): void {
  storage()?.setItem(PENDING_INVITE_KEY, code)
}

/** 소비 없이 존재만 확인 — 로그인 콜백이 착지 화면을 고를 때 사용. */
export function getPendingInviteCode(): string | null {
  return storage()?.getItem(PENDING_INVITE_KEY) ?? null
}

/** 읽으면서 제거 — 코드 입력 화면 프리필 후 재사용을 막는다. */
export function takePendingInviteCode(): string | null {
  const code = getPendingInviteCode()
  if (code !== null) storage()?.removeItem(PENDING_INVITE_KEY)
  return code
}
