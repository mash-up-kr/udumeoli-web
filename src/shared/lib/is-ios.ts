/**
 * iPhone·iPad·iPod 여부. Apple 로그인 노출 등 iOS 한정 UI 분기에 쓴다.
 *
 * SSR에선 navigator가 없으니 effect 안에서 호출할 것.
 * iPadOS 13+ 사파리는 UA가 Mac과 동일해서 "Macintosh + 멀티터치"로 구분한다 —
 * 터치 지원 Mac은 없어서 오탐은 없다.
 */
export function isIos(
  nav: Pick<Navigator, "userAgent" | "maxTouchPoints"> = navigator
): boolean {
  const { userAgent, maxTouchPoints } = nav
  if (/iPhone|iPad|iPod/.test(userAgent)) return true
  return /Macintosh/.test(userAgent) && maxTouchPoints > 1
}
