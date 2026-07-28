import { useState } from "react"
import { overlay } from "overlay-kit"
import { ArrowLeft } from "lucide-react"

import emojiCameraSrc from "../assets/emoji-camera.svg"
import emojiCroissantSrc from "../assets/emoji-croissant.svg"
import emojiFerrisWheelSrc from "../assets/emoji-ferris-wheel.svg"
import emojiShoppingBagSrc from "../assets/emoji-shopping-bag.svg"
import emojiTreeSrc from "../assets/emoji-tree.svg"
import photoFrame1Src from "../assets/photo-frame-1.jpg"
import photoFrame2Src from "../assets/photo-frame-2.jpg"
import photoFrame3Src from "../assets/photo-frame-3.jpg"
import photoMapSrc from "../assets/photo-map.jpg"
import pin1Src from "../assets/pin-1.svg"
import pin2Src from "../assets/pin-2.svg"
import { cn } from "@/shared/lib/utils"
import { ButtonIcon } from "@/shared/ui/button-icon"
import { ButtonCta } from "@/shared/ui/button-cta"

const SEEN_KEY = "photato-onboarding-seen"

type Step = 1 | 2 | 3

// 스텝별 카피·CTA (Figma 1951-14617 · 1946-12642 · 1946-12687)
const STEP_CONTENT = [
  {
    title: ["여행을 대표하는", "스티커를 골라요"],
    subtitle: "이번 여행, 하나의 스티커로 정의한다면?",
    cta: "다음",
  },
  {
    title: ["우리만의 여행 지도가", "만들어지는 중"],
    subtitle: "여행 이후, 지도 위에 스티커로 추억을 기록해요",
    cta: "다음",
  },
  {
    title: ["쉽게 기록하는", "우리의 여행 갤러리"],
    subtitle: "대표 사진으로, 우리만의 갤러리를 만들어요",
    cta: "시작하기",
  },
] as const

// 스텝1 스티커 칩 — 그래픽 안 장식 요소. left/top은 칩 중심 좌표(343×320 기준)
function StickerChip({
  iconSrc,
  label,
  inverse = false,
  className,
}: {
  iconSrc: string
  label: string
  /** 어두운 배경(빵 칩) 변형 */
  inverse?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        "absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-[9px] rounded-full px-[15px] py-[7px] whitespace-nowrap shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]",
        inverse
          ? "bg-bg-neutral-inverse text-fg-neutral-inverse"
          : "bg-bg-neutral-weak/70 text-fg-neutral-bold",
        className
      )}
    >
      <img src={iconSrc} alt="" className="size-9" />
      {/* 그래픽 전용 스케일 텍스트(21.95px) — 타이포 토큰에 없는 아트워크 크기라 값 고정 */}
      <span className="text-[22px] leading-[33px] font-bold tracking-[-0.18px]">
        {label}
      </span>
    </span>
  )
}

// 스텝1 그래픽 — 스티커 칩 5종 (Figma 1951-14626)
function StickerGraphic() {
  return (
    <>
      <StickerChip
        iconSrc={emojiCameraSrc}
        label="감성"
        className="top-[72px] left-[121px] -rotate-4"
      />
      <StickerChip
        iconSrc={emojiCroissantSrc}
        label="빵"
        inverse
        className="top-[130px] left-[211px] rotate-[2.2deg]"
      />
      <StickerChip
        iconSrc={emojiShoppingBagSrc}
        label="쇼핑"
        className="top-[202px] left-[102px] rotate-4"
      />
      <StickerChip
        iconSrc={emojiFerrisWheelSrc}
        label="액티비티"
        className="top-[211px] left-[250px] rotate-[-2.7deg]"
      />
      <StickerChip
        iconSrc={emojiTreeSrc}
        label="자연"
        className="top-[285px] left-[207px] rotate-4"
      />
    </>
  )
}

// 스텝2 그래픽 — 지도 카드 + 스티커 핀 (Figma 1946-12964)
function MapGraphic() {
  return (
    <div
      // 카드 배경 #81d5e7는 토큰에 없음 → 가장 근접한 blue-300 사용 (사진 로드 전 fallback으로만 노출)
      className="absolute top-[calc(50%+14px)] left-1/2 size-[250px] -translate-x-1/2 -translate-y-1/2 overflow-clip rounded-[32px] bg-blue-300"
    >
      {/* 회전된 지도 스크린샷 — Figma 크롭(455×424 프레임, 50.26° 회전, 223% 확대) 근사 재현 */}
      <div className="absolute top-[-130px] left-[-171px] flex h-[622px] w-[618px] items-center justify-center">
        <div className="relative h-[424px] w-[455px] flex-none rotate-[50.26deg] overflow-hidden">
          <img
            src={photoMapSrc}
            alt=""
            className="absolute top-[-127%] left-[-123%] w-[223%] max-w-none"
          />
        </div>
      </div>
      <img
        src={pin1Src}
        alt=""
        className="absolute top-[97px] left-[10px] w-[149px] rotate-[-83.62deg]"
      />
      <img
        src={pin2Src}
        alt=""
        className="absolute top-[33px] left-[14px] w-[88px] rotate-[19.81deg]"
      />
      <img
        src={emojiShoppingBagSrc}
        alt=""
        className="absolute top-[30px] left-[106px] size-[47px] rotate-4"
      />
    </div>
  )
}

// 스텝3 사진 프레임 — 흰 7px 테두리 · radius 26 (Figma image Frame)
function PhotoFrame({ src, className }: { src: string; className?: string }) {
  return (
    <span
      className={cn(
        "absolute block overflow-hidden rounded-[26px] border-7 border-stroke-neutral-inverse shadow-[0px_0px_32px_0px_rgba(142,150,169,0.12)]",
        className
      )}
    >
      <img src={src} alt="" className="size-full object-cover object-top" />
    </span>
  )
}

// 스텝3 그래픽 — 예시 사진 3장 (Figma 1946-13042)
function GalleryGraphic() {
  return (
    <>
      <PhotoFrame
        src={photoFrame1Src}
        className="top-[177px] left-[157px] size-[134px] rotate-4"
      />
      <PhotoFrame
        src={photoFrame2Src}
        className="top-[132px] left-[47px] size-[135px]"
      />
      <PhotoFrame
        src={photoFrame3Src}
        className="top-[60px] left-1/2 h-[154px] w-[128px] -translate-x-1/2 -rotate-4"
      />
    </>
  )
}

const STEP_GRAPHICS = [StickerGraphic, MapGraphic, GalleryGraphic]

function OnboardingOverlay({ unmount }: { unmount: () => void }) {
  const [step, setStep] = useState<Step>(1)
  const { title, subtitle, cta } = STEP_CONTENT[step - 1]
  const Graphic = STEP_GRAPHICS[step - 1]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="서비스 소개"
      // 낮은 화면에서는 spacer(flex-1)가 먼저 줄고, 그래도 넘치면 스크롤로 대응
      className="fixed inset-y-0 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 flex-col overflow-y-auto bg-bg-neutral-subtle"
    >
      {/* 헤더(76px) — 스텝 2·3에서만 뒤로가기, 스텝1은 자리만 유지해 타이틀 위치 고정 */}
      <div className="flex h-[76px] shrink-0 items-start px-4 py-2">
        {step > 1 && (
          <ButtonIcon
            aria-label="이전 단계로"
            onClick={() => setStep((step - 1) as Step)}
          >
            <ArrowLeft />
          </ButtonIcon>
        )}
      </div>

      {/* 스텝 전환 시 타이틀·그래픽만 가볍게 페이드 인 (시안에 모션 명세 없음) */}
      <div
        key={step}
        className="flex shrink-0 animate-in flex-col items-center duration-300 fade-in-0"
      >
        <div className="flex flex-col gap-4 px-4 text-center">
          <h2 className="text-h3 text-fg-neutral-bold">
            {title[0]}
            <br />
            {title[1]}
          </h2>
          <p className="text-h6-1 text-fg-neutral-subtle">{subtitle}</p>
        </div>
        {/* 그래픽 영역 343×320 — 시안 annotation상 추후 전부 교체 예정 */}
        <div aria-hidden className="relative h-[320px] w-[343px]">
          <Graphic />
        </div>
      </div>

      <div className="min-h-6 flex-1" />

      {/* 진행 표시 — 현재 스텝은 16×8 pill, 나머지는 8px 점 */}
      <p className="sr-only">3단계 중 {step}단계</p>
      <div
        aria-hidden
        className="flex shrink-0 items-center justify-center gap-2"
      >
        {([1, 2, 3] as const).map((s) => (
          <span
            key={s}
            className={cn(
              "h-2 rounded-full",
              s === step ? "w-4 bg-bg-neutral-inverse" : "w-2 bg-neutral-200"
            )}
          />
        ))}
      </div>

      <div className="shrink-0 px-4 pt-10 pb-8">
        <ButtonCta
          onClick={step === 3 ? unmount : () => setStep((step + 1) as Step)}
        >
          {cta}
        </ButtonCta>
      </div>
    </div>
  )
}

/**
 * 첫 진입 온보딩 (Figma 1951-14617 → 1946-12642 → 1946-12687) —
 * 회원가입 완료 팝업의 확인 클릭 시 1회만 노출되는 3단계 풀스크린 안내.
 * 다음/시작하기로 진행, 스텝 2·3에선 뒤로가기 가능.
 */
export function openOnboardingOverlay(): void {
  // 한 번이라도 노출되면 확인한 것으로 처리 — 재접속 시 다시 노출되지 않음
  if (localStorage.getItem(SEEN_KEY) !== null) return
  localStorage.setItem(SEEN_KEY, "true")

  overlay.open(({ unmount }) => <OnboardingOverlay unmount={unmount} />)
}
