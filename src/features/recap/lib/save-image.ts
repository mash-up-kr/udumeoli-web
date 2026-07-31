/**
 * 리캡 이미지 저장 — 미리보기(placeholder)와 동일한 그림을 canvas로 그려 PNG 다운로드.
 * 최종 그래픽은 추후(8/1 해커톤) 확정 예정이라 지금은 미리보기 placeholder 그대로 내보낸다.
 * 실패 시 throw — 성공/실패 토스트는 호출부 담당.
 */

// 시안 1745-38383: 270×480 · radius 32. 선명도를 위해 2배 해상도로 내보낸다.
const PREVIEW_WIDTH = 270
const PREVIEW_HEIGHT = 480
const PREVIEW_RADIUS = 32
const EXPORT_SCALE = 2

/** CSS 디자인 토큰 값을 읽는다 — canvas에는 클래스를 못 쓰므로 런타임에 해석 */
function resolveColorToken(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
  return value || fallback
}

export async function saveRecapImage(): Promise<void> {
  const canvas = document.createElement("canvas")
  canvas.width = PREVIEW_WIDTH * EXPORT_SCALE
  canvas.height = PREVIEW_HEIGHT * EXPORT_SCALE

  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("canvas 2d context를 사용할 수 없어요")

  ctx.scale(EXPORT_SCALE, EXPORT_SCALE)
  ctx.fillStyle = resolveColorToken("--color-neutral-600", "#4f5566")
  ctx.beginPath()
  ctx.roundRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT, PREVIEW_RADIUS)
  ctx.fill()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png")
  )
  if (!blob) throw new Error("이미지 생성에 실패했어요")

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "photato-recap.png"
  link.click()
  // 즉시 revoke하면 일부 브라우저에서 다운로드가 중단될 수 있어 지연 해제
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
