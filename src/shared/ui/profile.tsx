import type { ComponentProps } from "react"

import iconCameraAddSrc from "@/shared/assets/icon-camera-add.svg"
import profileDefaultSrc from "@/shared/assets/profile-default.svg"
import { cn } from "@/shared/lib/utils"

/** 기본 프로필 이미지 (추후 교체 예정). 번들 import라 배포 base path와 무관하게 동작. */
export const DEFAULT_PROFILE_SRC = profileDefaultSrc

export type ProfileSize = "xs" | "sm" | "md" | "lg" | "xl"
export type ProfileType = "default" | "selected" | "add-image"

const sizeStyles: Record<ProfileSize, string> = {
  xs: "size-4", // 16
  sm: "size-6", // 24
  md: "size-8", // 32
  lg: "size-[60px]",
  xl: "size-[120px]",
}

// 사이즈·타입별 테두리 (default/add-image: stroke-neutral-weak, selected: stroke-neutral-bold)
function borderClass(type: ProfileType, size: ProfileSize): string {
  if (type === "selected") {
    const w =
      size === "xl" ? "border-[3px]" : size === "lg" ? "border-2" : "border"
    return `${w} border-stroke-neutral-bold`
  }
  const w = size === "xl" ? "border-2" : "border"
  return `${w} border-stroke-neutral-weak`
}

/**
 * Profile (Figma Profile v1.0.0) — 원형 아바타.
 *
 * size: xs(16)/sm(24)/md(32)/lg(60)/xl(120). type: default·selected(테두리 강조)·add-image(카메라 배지).
 * `src` 미지정 시 기본 이미지. add-image는 lg·xl에서 카메라 배지를 노출한다.
 */
function Profile({
  size = "lg",
  type = "default",
  src = DEFAULT_PROFILE_SRC,
  alt = "프로필 사진",
  onImageClick,
  className,
  ...props
}: Omit<ComponentProps<"div">, "children"> & {
  size?: ProfileSize
  type?: ProfileType
  src?: string
  alt?: string
  /** add-image 타입에서 카메라 배지 클릭 핸들러 */
  onImageClick?: () => void
}) {
  const showBadge = type === "add-image" && (size === "lg" || size === "xl")

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      <img
        src={src}
        alt={alt}
        className={cn(
          "size-full rounded-full object-cover",
          borderClass(type, size)
        )}
      />
      {showBadge ? (
        <button
          type="button"
          aria-label="프로필 사진 변경"
          onClick={onImageClick}
          className={cn(
            "absolute right-0 bottom-0 flex items-center justify-center rounded-full bg-bg-neutral-inverse text-fg-neutral-inverse",
            size === "xl" ? "p-2" : "p-1"
          )}
        >
          <img
            src={iconCameraAddSrc}
            alt=""
            className={size === "xl" ? "size-6" : "size-3"}
          />
        </button>
      ) : null}
    </div>
  )
}

export { Profile }
