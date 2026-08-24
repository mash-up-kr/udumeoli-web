import { cn } from "@/shared/lib/utils"
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
 * 아웃라인 워드마크 + 키워드 스티커 클러스터 (Figma "배경 변경" 2632-37319·2632-37293 공용).
 *
 * 375×254 박스 안에 스티커·로고를 절대 배치한다. 스플래시(AppSplash)와
 * 랜딩(LandingPage)이 같은 그래픽을 공유하며, 배경·주변 레이아웃은 호출부 책임.
 * `logoPulse`는 대기 상태(스플래시)에서 로고에 pulse 애니메이션을 켠다.
 */
export function LogoStickerCluster({
  className,
  logoPulse = false,
}: {
  className?: string
  logoPulse?: boolean
}) {
  return (
    <div className={cn("relative h-[254px] w-[375px] shrink-0", className)}>
      {/* 로고 뒤 스티커 — 디저트·사진 */}
      <Sticker
        src={stickerDessertSrc}
        className="top-[63px] left-[291px] size-[94px] rotate-[26deg]"
      />
      <Sticker
        src={stickerPhotoSrc}
        className="top-[76px] left-[102px] size-[107px] -rotate-4"
      />
      {/* 아웃라인 워드마크 — 흰 스트로크·그림자 포함 svg */}
      <img
        src={logoOutlineSrc}
        alt="Pinnned"
        className={cn(
          "absolute top-[132px] left-[188px] w-[251px] max-w-none -translate-x-1/2 -translate-y-1/2 -rotate-[3.5deg]",
          logoPulse && "animate-pulse"
        )}
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
      {/* 맛집(가로형 256×192) — 정사각 박스 중앙 크롭. 지도 스티커의 food fit과 같은 크롭 값.
          시안(2632:37334)은 이 인스턴스만 좌우 반전(수저가 왼쪽) — 크롭 박스째 미러링 */}
      <span className="absolute top-[204px] left-[94px] block size-[122px] -translate-x-1/2 -translate-y-1/2 -scale-x-100 overflow-hidden">
        <img
          src={stickerFoodSrc}
          alt=""
          className="pointer-events-none absolute top-[3.06%] left-[-19.13%] h-[100.94%] w-[134.59%] max-w-none"
        />
      </span>
    </div>
  )
}
