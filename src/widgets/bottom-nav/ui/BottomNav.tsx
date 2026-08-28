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
        {/* 새 시안(2897-19246) 기준 두 탭 모두 fg-neutral-subtle(#8e96a9)로 동일.
            앨범 페이지(1846-3645)에선 활성 탭만 흰색 */}
        <button
          type="button"
          onClick={onAlbumClick}
          disabled={albumDisabled}
          className={cn(
            "flex h-[49px] w-[84px] flex-col items-center justify-between py-[5px]",
            active === "album" ? "text-white" : "text-fg-neutral-subtle",
            albumDisabled && "cursor-default"
          )}
          aria-current={active === "album" ? "page" : undefined}
        >
          {/* 여행 앨범 아이콘 (시안 1893-13193) — 활성/비활성 색을 따라가도록 currentColor */}
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            className="size-[18px]"
          >
            <path
              d="M13.2589 16.767C13.2589 17.2124 13.7975 17.4355 14.1125 17.1205L17.4054 13.8276C17.7204 13.5126 17.4973 12.9741 17.0518 12.9741H14.3964C14.0773 12.9741 13.8079 13.0838 13.5882 13.3033C13.3687 13.523 13.2589 13.7924 13.2589 14.1116V16.767ZM5.07175 21.2033C4.44609 21.2033 3.9105 20.9805 3.465 20.535C3.0195 20.0895 2.79675 19.5539 2.79675 18.9283V5.07175C2.79675 4.44609 3.0195 3.9105 3.465 3.465C3.9105 3.0195 4.44609 2.79675 5.07175 2.79675H18.9283C19.5539 2.79675 20.0895 3.0195 20.535 3.465C20.9805 3.9105 21.2033 4.44609 21.2033 5.07175V14.0913C21.2033 14.3948 21.1463 14.6841 21.0323 14.9593C20.9184 15.2343 20.7558 15.4773 20.5445 15.6885L15.6885 20.5445C15.4773 20.7558 15.2343 20.9184 14.9593 21.0323C14.6841 21.1463 14.3948 21.2033 14.0913 21.2033H5.07175ZM6.87375 12.9741H10.0886C10.3837 12.9741 10.6312 12.8732 10.8311 12.6716C11.0307 12.4699 11.1306 12.2215 11.1306 11.9263C11.1306 11.6311 11.0307 11.3837 10.8311 11.1841C10.6312 10.9842 10.3837 10.8843 10.0886 10.8843H6.87975C6.58292 10.8843 6.33409 10.9842 6.13325 11.1841C5.93242 11.3837 5.832 11.6311 5.832 11.9263C5.832 12.2215 5.93184 12.4699 6.1315 12.6716C6.33117 12.8732 6.57859 12.9741 6.87375 12.9741ZM6.87375 8.88431H14.6468C14.9419 8.88431 15.1893 8.78348 15.389 8.58181C15.5887 8.38031 15.6885 8.13189 15.6885 7.83656C15.6885 7.54139 15.5887 7.29398 15.389 7.09431C15.1893 6.89464 14.9419 6.79481 14.6468 6.79481H6.87975C6.58292 6.79481 6.33409 6.89464 6.13325 7.09431C5.93242 7.29398 5.832 7.54139 5.832 7.83656C5.832 8.13189 5.93184 8.38031 6.1315 8.58181C6.33117 8.78348 6.57859 8.88431 6.87375 8.88431Z"
              fill="currentColor"
            />
          </svg>
          <span className="text-[10px] font-semibold tracking-[-0.2px]">
            여행 앨범
          </span>
        </button>
        <button
          type="button"
          onClick={onMyPageClick}
          className="flex h-[49px] w-[84px] flex-col items-center justify-between py-[5px] text-fg-neutral-subtle"
        >
          {/* 마이페이지 아이콘 (시안 2897-19253 icon-person) — 활성/비활성 색을 따라가도록 currentColor */}
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            className="size-[18px]"
          >
            <path
              d="M9.0285 10.6665C8.20733 9.84533 7.79675 8.85483 7.79675 7.695C7.79675 6.53533 8.20733 5.54583 9.0285 4.7265C9.84967 3.90733 10.8402 3.49775 12 3.49775C13.1598 3.49775 14.1503 3.90733 14.9715 4.7265C15.7927 5.54583 16.2032 6.53533 16.2032 7.695C16.2032 8.85483 15.7927 9.84533 14.9715 10.6665C14.1503 11.4877 13.1598 11.8982 12 11.8982C10.8402 11.8982 9.84967 11.4877 9.0285 10.6665ZM3.79675 18.03V17.2898C3.79675 16.6871 3.95258 16.1323 4.26425 15.6255C4.57575 15.1187 4.99108 14.7323 5.51025 14.4663C6.55558 13.9456 7.61958 13.5541 8.70225 13.2918C9.78475 13.0294 10.884 12.8982 12 12.8982C13.1238 12.8982 14.2271 13.0284 15.3097 13.2887C16.3924 13.5491 17.4524 13.9396 18.4897 14.4602C19.0089 14.7262 19.4242 15.1117 19.7357 15.6165C20.0474 16.1215 20.2032 16.6793 20.2032 17.2898V18.03C20.2032 18.6597 19.9815 19.1963 19.538 19.6398C19.0945 20.0833 18.5579 20.305 17.9282 20.305H6.07175C5.44208 20.305 4.9055 20.0833 4.462 19.6398C4.0185 19.1963 3.79675 18.6597 3.79675 18.03Z"
              fill="currentColor"
            />
          </svg>
          <span className="text-[10px] font-semibold tracking-[-0.2px]">
            마이페이지
          </span>
        </button>
      </div>

      {/* 중앙 지구본(시안 2885-8192, 96×96 래스터라 2x PNG) — 바 상단 위로 35px 돌출(시안 y:-35.36).
          핸들러 주입 시 지도 이동 버튼 */}
      {onGlobeClick ? (
        <button
          type="button"
          aria-label="지도 보기"
          onClick={onGlobeClick}
          className="absolute bottom-[16px] left-1/2 -translate-x-1/2"
        >
          <img src={globeSrc} alt="" className="size-[96px]" />
        </button>
      ) : (
        <img
          src={globeSrc}
          alt=""
          className="pointer-events-none absolute bottom-[16px] left-1/2 size-[96px] -translate-x-1/2"
        />
      )}
    </nav>
  )
}

export { BottomNav }
