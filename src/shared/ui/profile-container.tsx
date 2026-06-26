import * as React from "react"
import { Camera } from "lucide-react"

import { cn } from "@/shared/lib/utils"

export type ProfileSize = "sm" | "md" | "lg"

const sizeStyles: Record<ProfileSize, string> = {
  sm: "size-12",
  md: "size-20",
  lg: "size-[100px]",
}

const editButtonSizeStyles: Record<ProfileSize, string> = {
  sm: "size-5",
  md: "size-6",
  lg: "size-7",
}

export interface ProfileContainerProps {
  src?: string
  name?: string
  size?: ProfileSize
  onEdit?: () => void
  className?: string
}

export function ProfileContainer({
  src,
  name,
  size = "md",
  onEdit,
  className,
}: ProfileContainerProps) {
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    setError(false)
  }, [src])

  const showImage = src && !error

  return (
    <div className={cn("relative shrink-0", sizeStyles[size], className)}>
      <div
        className={cn(
          "size-full overflow-hidden rounded-full bg-neutral-300",
          "flex items-center justify-center"
        )}
      >
        {showImage ? (
          <img
            src={src}
            alt={name ?? "프로필 사진"}
            loading="lazy"
            decoding="async"
            onError={() => setError(true)}
            className="size-full object-cover"
          />
        ) : (
          <span className="text-center text-h4 leading-tight text-white">
            {name ? (
              name.slice(0, 2)
            ) : (
              <>
                프로필
                <br />
                사진
              </>
            )}
          </span>
        )}
      </div>

      {onEdit ? (
        <button
          type="button"
          aria-label="프로필 사진 변경"
          onClick={onEdit}
          className={cn(
            "absolute right-0 bottom-0",
            "flex items-center justify-center rounded-full bg-neutral-900",
            editButtonSizeStyles[size]
          )}
        >
          <Camera className="size-[55%] text-white" />
        </button>
      ) : null}
    </div>
  )
}
