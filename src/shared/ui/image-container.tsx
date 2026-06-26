import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/shared/lib/utils"

export type AspectRatio = "square" | "video" | "portrait"

const aspectRatioStyles: Record<AspectRatio, string> = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
}

export interface ImageContainerProps extends React.ComponentProps<"div"> {
  src?: string
  alt?: string
  width?: number
  height?: number
  aspectRatio?: AspectRatio
  /** 뷰포트 최상단 LCP 이미지는 "eager" + fetchPriority="high" 권장 */
  loading?: "lazy" | "eager"
  fetchPriority?: "high" | "low" | "auto"
  onRemove?: () => void
}

export function ImageContainer({
  src,
  alt = "",
  width,
  height,
  aspectRatio = "square",
  loading = "lazy",
  fetchPriority = "auto",
  onRemove,
  className,
  ...props
}: ImageContainerProps) {
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    setError(false)
  }, [src])

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[8px] bg-neutral-150",
        aspectRatioStyles[aspectRatio],
        className
      )}
      {...props}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          onError={() => setError(true)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}

      {onRemove ? (
        <button
          type="button"
          aria-label="이미지 제거"
          onClick={onRemove}
          className="absolute top-1.5 right-1.5 flex size-5.5 items-center justify-center rounded-full bg-neutral-900/60"
        >
          <X className="size-3 text-white" />
        </button>
      ) : null}
    </div>
  )
}
