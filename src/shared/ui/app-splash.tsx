import { MobileLayout } from "./mobile-layout"
import { cn } from "@/shared/lib/utils"
import skyBackgroundSrc from "@/shared/assets/sky-background.png"
import logoOutlineSrc from "@/shared/assets/logo-pinnned-outline.svg"
import stickerDessertSrc from "@/shared/assets/map-stickers/dessert.png"
import stickerPhotoSrc from "@/shared/assets/map-stickers/photo.png"
import stickerActivitySrc from "@/shared/assets/map-stickers/activity.png"
import stickerHealingSrc from "@/shared/assets/map-stickers/healing.png"
import stickerFoodSrc from "@/shared/assets/map-stickers/food.png"

// 클러스터 장식 스티커 — Figma 375×812 프레임 좌표(중심점)를 클러스터 원점(y-232)으로 옮겨 배치
function Sticker({ src, className }: { src: string; className?: string }) {
  return (
    <img
      src={src}
      alt=""
      className={cn(
        "pointer-events-none absolute max-w-none -translate-x-1/2 -translate-y-1/2",
        className
      )}
    />
  )
}

/**
 * 라우트 진입 판정 중(세션·팟 persist 복원, me/myParties 응답 대기, 리다이렉트 직전)에
 * 쓰는 전체 화면 대기 상태. 이 구간을 null로 두면 흰 화면만 남는다 —
 * 목 모드에선 한 틱이라 안 보이지만 실서버에선 네트워크 왕복만큼 지속된다.
 *
 * 하늘 배경 + 아웃라인 워드마크·키워드 스티커 클러스터 (Figma 2632-37319 "배경 변경").
 * 스티커 그래픽은 지도 핀과 같은 map-stickers 에셋을 재사용한다.
 */
export function AppSplash() {
  return (
    <MobileLayout className="relative flex h-dvh flex-col items-center justify-center overflow-hidden bg-bg-neutral-subtle">
      <img
        src={skyBackgroundSrc}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      {/* 시안상 클러스터 중심이 화면 정중앙보다 47px 위 (Figma 로고 y 364/812) */}
      <div className="relative h-[254px] w-[375px] shrink-0 -translate-y-[47px]">
        {/* 로고 뒤 스티커 — 디저트·사진 */}
        <Sticker
          src={stickerDessertSrc}
          className="top-[63px] left-[291px] size-[94px] rotate-[26deg]"
        />
        <Sticker
          src={stickerPhotoSrc}
          className="top-[76px] left-[102px] size-[107px] -rotate-4"
        />
        {/* 아웃라인 워드마크 — 흰 스트로크·그림자 포함 svg. 대기 상태 표시를 위해 기존 스플래시의 pulse 유지 */}
        <img
          src={logoOutlineSrc}
          alt="Pinnned"
          className="absolute top-[132px] left-[188px] w-[251px] max-w-none -translate-x-1/2 -translate-y-1/2 -rotate-[3.5deg] animate-pulse"
        />
        {/* 로고 앞 스티커 — 액티비티·힐링·맛집 */}
        <Sticker
          src={stickerActivitySrc}
          className="top-[162px] left-[323px] size-[94px]"
        />
        <Sticker
          src={stickerHealingSrc}
          className="top-[204px] left-[269px] size-[74px] rotate-[26deg]"
        />
        {/* 맛집(가로형 256×192) — 정사각 박스 중앙 크롭. 지도 스티커의 food fit과 같은 크롭 값 */}
        <span className="absolute top-[204px] left-[94px] block size-[122px] -translate-x-1/2 -translate-y-1/2 overflow-hidden">
          <img
            src={stickerFoodSrc}
            alt=""
            className="pointer-events-none absolute top-[3.06%] left-[-19.13%] h-[100.94%] w-[134.59%] max-w-none"
          />
        </span>
      </div>
    </MobileLayout>
  )
}
