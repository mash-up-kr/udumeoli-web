import type { ComponentProps } from "react"

import { cn } from "@/shared/lib/utils"

/**
 * Chip (Design System v1.0.0 · Figma Chip).
 *
 * 흰 pill · `bg-neutral-weak` · shadow, 라벨 `text-h9` · `fg-neutral-bold`.
 * `profileSrc`를 주면 좌측에 16px 프로필(테두리 `stroke-neutral-weak`)이 붙는 With Profile 변형.
 */
function Chip({
  label,
  profileSrc,
  className,
  ...props
}: Omit<ComponentProps<"div">, "children"> & {
  label: string
  profileSrc?: string
}) {
  const withProfile = profileSrc != null

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-full bg-bg-neutral-weak py-1",
        "shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]",
        withProfile ? "max-w-[103px] px-2" : "px-3",
        className
      )}
      {...props}
    >
      {withProfile ? (
        <img
          src={profileSrc}
          alt=""
          className="size-4 shrink-0 rounded-full border border-stroke-neutral-weak object-cover"
        />
      ) : null}
      <span
        className={cn(
          "truncate text-center text-h9 text-fg-neutral-bold",
          withProfile && "min-w-0 flex-1"
        )}
      >
        {label}
      </span>
    </div>
  )
}

export { Chip }
