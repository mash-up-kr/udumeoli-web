export type CameraPadding = {
  top: number
  bottom: number
  left: number
  right: number
}

const DESIGN_VERTICAL_PADDING = 500
const MIN_CAMERA_VIEWPORT_HEIGHT = 180
const DESIGN_PADDING = { top: 170, bottom: 330 }

export function getRecordCameraPadding(
  width: number,
  height: number
): CameraPadding {
  const verticalScale = Math.min(
    1,
    Math.max(0, (height - MIN_CAMERA_VIEWPORT_HEIGHT) / DESIGN_VERTICAL_PADDING)
  )
  const horizontalPadding = Math.min(
    48,
    Math.max(24, Math.ceil((width - 280) / 2))
  )

  return {
    top: Math.round(DESIGN_PADDING.top * verticalScale),
    bottom: Math.round(DESIGN_PADDING.bottom * verticalScale),
    left: horizontalPadding,
    right: horizontalPadding,
  }
}
