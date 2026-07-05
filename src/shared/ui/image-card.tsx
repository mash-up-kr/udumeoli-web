import type { ComponentProps } from "react"

import { cn } from "@/shared/lib/utils"

export type ImageCardSize = "lg" | "sm"
export type ImageCardTint = "blue" | "orange" | "indigo"

const sizeStyles: Record<
  ImageCardSize,
  { root: string; handle: string; title: string; subtitle: string }
> = {
  lg: {
    root: "h-48 w-40 gap-3 rounded-[60px] border-[6px]",
    handle: "h-1.5 w-10",
    title: "text-h3",
    subtitle: "text-e3",
  },
  sm: {
    root: "h-36 w-30 gap-2 rounded-[48px] border-[5px]",
    handle: "h-[5px] w-7.5",
    title: "text-h5",
    subtitle: "text-e4",
  },
}

const tintStyles: Record<ImageCardTint, string> = {
  blue: "from-blue-500",
  orange: "from-orange-100",
  indigo: "from-indigo-100",
}

export interface ImageCardProps extends ComponentProps<"div"> {
  src: string
  /** 지역명 (예: 강릉) */
  title: string
  /** 기간 (예: 3days) */
  subtitle?: string
  size?: ImageCardSize
  /** 이미지 상단 그라디언트 색 */
  tint?: ImageCardTint
}

/**
 * ImageCard (Figma Image Card v1.0.0).
 *
 * 흰 테두리 + 상단 틴트 그라디언트 이미지 위에 지역명·기간을 표시하는 태그 모양 카드.
 */
function ImageCard({
  src,
  title,
  subtitle,
  size = "lg",
  tint = "blue",
  className,
  ...props
}: ImageCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center overflow-hidden border-stroke-neutral-inverse py-3 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]",
        sizeStyles[size].root,
        className
      )}
      {...props}
    >
      <div aria-hidden className="absolute inset-0">
        <img src={src} alt="" className="size-full object-cover" />
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-b to-neutral-0/0",
            tintStyles[tint]
          )}
        />
      </div>
      <div
        className={cn(
          "relative shrink-0 rounded-[20px] bg-fg-neutral-inverse",
          sizeStyles[size].handle
        )}
      />
      <div className="relative flex w-full flex-col items-center text-center text-fg-neutral-inverse [text-shadow:0_0_6px_rgba(79,85,102,0.5)]">
        <p className={sizeStyles[size].title}>{title}</p>
        {subtitle ? (
          <p className={cn("font-eng", sizeStyles[size].subtitle)}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export { ImageCard }
