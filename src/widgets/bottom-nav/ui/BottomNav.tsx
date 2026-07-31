import { Images, User } from "lucide-react"
import globeSrc from "../assets/globe.png"
import type { ComponentProps } from "react"

import { cn } from "@/shared/lib/utils"

/**
 * 지도 메인 하단 내비게이션 (시안 1745-38063). 어두운 필 바 위에 지구본이 얹힌 형태.
 * 좌측 여행 앨범 / 우측 마이페이지 — 이동 동작은 페이지에서 주입
 * (Storybook 환경은 라우팅 플러그인이 없으므로 props로 추상화).
 */
function BottomNav({
  className,
  active,
  onAlbumClick,
  onMyPageClick,
  onGlobeClick,
  albumDisabled = false,
  ...props
}: ComponentProps<"nav"> & {
  /** 현재 화면 탭 — 앨범 페이지(시안 1846-3645)에선 여행 앨범 활성(흰색) */
  active?: "album"
  onAlbumClick?: () => void
  onMyPageClick?: () => void
  /** 중앙 지구본 클릭 — 지정 시 버튼으로 렌더 (앨범 → 지도 이동) */
  onGlobeClick?: () => void
  /** 여행 기록이 하나도 없으면 지도에서 앨범 진입 불가 */
  albumDisabled?: boolean
}) {
  return (
    <nav
      aria-label="주요 메뉴"
      className={cn("relative mx-auto w-[310px]", className)}
      {...props}
    >
      <div className="flex items-center justify-between rounded-full border border-stroke-neutral-inverse bg-neutral-900 px-[21px] py-[13px]">
        {/* 지도 시안 기준 여행 앨범 white/30 · 마이페이지 white/60 — 토큰에 없는 white alpha라 하드코딩.
            앨범 페이지(1846-3645)에선 활성 탭 흰색 · 비활성 fg-neutral-subtle */}
        <button
          type="button"
          onClick={onAlbumClick}
          disabled={albumDisabled}
          className={cn(
            "flex h-[49px] w-[84px] flex-col items-center justify-between py-[5px]",
            active === "album" ? "text-white" : "text-white/30",
            albumDisabled && "cursor-default"
          )}
          aria-current={active === "album" ? "page" : undefined}
        >
          <Images aria-hidden className="size-[18px]" />
          <span className="text-[10px] font-semibold tracking-[-0.2px]">
            여행 앨범
          </span>
        </button>
        <button
          type="button"
          onClick={onMyPageClick}
          className={cn(
            "flex h-[49px] w-[84px] flex-col items-center justify-between py-[5px]",
            active === "album" ? "text-fg-neutral-subtle" : "text-white/60"
          )}
        >
          <User aria-hidden className="size-[18px]" />
          <span className="text-[10px] font-semibold tracking-[-0.2px]">
            마이페이지
          </span>
        </button>
      </div>

      {/* 중앙 지구본 — 바 위로 절반쯤 겹쳐 떠 있음. 핸들러 주입 시 지도 이동 버튼 */}
      {onGlobeClick ? (
        <button
          type="button"
          aria-label="지도 보기"
          onClick={onGlobeClick}
          className="absolute bottom-[14px] left-1/2 -translate-x-1/2"
        >
          <img src={globeSrc} alt="" className="size-[98px]" />
        </button>
      ) : (
        <img
          src={globeSrc}
          alt=""
          className="pointer-events-none absolute bottom-[14px] left-1/2 size-[98px] -translate-x-1/2"
        />
      )}
    </nav>
  )
}

export { BottomNav }
