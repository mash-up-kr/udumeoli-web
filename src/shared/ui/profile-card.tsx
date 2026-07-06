import { ChevronRight } from "lucide-react"
import type { ComponentProps } from "react"

import { cn } from "@/shared/lib/utils"
import { Profile } from "@/shared/ui/profile"

/**
 * ProfileCard (Figma ProfileCard v1.0.0).
 *
 * 60px 프로필 + 닉네임(H5) + "프로필 수정" 링크. `onEdit`로 편집 진입.
 */
function ProfileCard({
  nickname,
  profileSrc,
  onEdit,
  className,
  ...props
}: Omit<ComponentProps<"div">, "children"> & {
  nickname: string
  profileSrc?: string
  onEdit?: () => void
}) {
  return (
    <div
      className={cn(
        "flex w-[343px] items-center gap-5 rounded-3xl border border-stroke-neutral-weak bg-bg-neutral-subtle px-3 py-4",
        className
      )}
      {...props}
    >
      <Profile size="lg" src={profileSrc} alt={nickname} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-h5 text-fg-neutral-bold">{nickname}</p>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-h8-1 text-fg-neutral-subtle"
        >
          프로필 수정
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

export { ProfileCard }
