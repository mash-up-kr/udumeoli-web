import { useState } from "react"
import { overlay } from "overlay-kit"
import { ArrowLeft } from "lucide-react"

import photoFrame1Src from "../assets/photo-frame-1.jpg"
import photoFrame2Src from "../assets/photo-frame-2.jpg"
import photoFrame3Src from "../assets/photo-frame-3.jpg"
import photoMapSrc from "../assets/photo-map.jpg"
import pin1Src from "../assets/pin-1.svg"
import pin2Src from "../assets/pin-2.svg"
import emojiTreeSrc from "@/shared/assets/emoji-tree.svg"
import emojiShoppingBagSrc from "@/shared/assets/emoji-shopping-bag.svg"
import emojiFerrisWheelSrc from "@/shared/assets/emoji-ferris-wheel.svg"
import emojiCroissantSrc from "@/shared/assets/emoji-croissant.svg"
import emojiCameraSrc from "@/shared/assets/emoji-camera.svg"
import skyBackgroundSrc from "@/shared/assets/sky-background.png"
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
        // w-max: absolute 요소의 shrink-to-fit이 컨테이너 우측 edge에 막혀
        // 배경 pill이 글자보다 좁아지는 것 방지 (액티비티 칩)
        "absolute flex w-max -translate-x-1/2 -translate-y-1/2 items-center gap-[9px] rounded-full px-[15px] py-[7px] whitespace-nowrap shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]",
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
        label="힐링"
        className="top-[72px] left-[121px] -rotate-4"
      />
      <StickerChip
        iconSrc={emojiCroissantSrc}
        label="맛집"
        inverse
        className="top-[130px] left-[211px] rotate-[2.2deg]"
      />
      <StickerChip
        iconSrc={emojiShoppingBagSrc}
        label="도시"
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

function OnboardingOverlay({
  onFinish,
  unmount,
}: {
  /** "시작하기" — 다음 화면 이동. 끝나면 오버레이가 페이드아웃 후 걷힌다 */
  onFinish: () => void | Promise<void>
  unmount: () => void
}) {
  const [step, setStep] = useState<Step>(1)
  const [closing, setClosing] = useState(false)
  const { title, subtitle, cta } = STEP_CONTENT[step - 1]
  const Graphic = STEP_GRAPHICS[step - 1]

  const finish = async () => {
    // 이동이 끝난 뒤 페이드아웃 — 먼저 걷으면 아래 깔린 이전 화면이 잠깐 비치고,
    // 그냥 걷으면 다음 화면이 '확' 나타난다
    try {
      await onFinish()
    } finally {
      // 이동이 실패(reject)해도 오버레이는 걷는다 — 안 그러면 화면을 영구히 덮는다
      setClosing(true)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="서비스 소개"
      className={cn(
        "fixed inset-y-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 bg-bg-neutral-subtle",
        closing && "animate-out duration-300 fade-out-0 fill-mode-forwards"
      )}
      onAnimationEnd={(e) => {
        // 스텝 전환 페이드인(자식) 이벤트는 무시하고 루트 페이드아웃이 끝났을 때만 걷는다
        if (closing && e.target === e.currentTarget) unmount()
      }}
    >
      {/* 배경 — 하늘 사진 + 블러 그라디언트 (Figma 2632-37600·37601).
          스크롤 컨테이너 밖에 둬서 내용이 스크롤돼도 배경은 고정된다 */}
      <img
        src={skyBackgroundSrc}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      {/* 그라디언트 끝색 #66BDFF는 팔레트 밖 → 최근접 토큰 blue-500(#6CBCF9) 사용 */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-blue-50/20 to-blue-500/20 backdrop-blur-[30px]"
      />

      {/* 낮은 화면에서는 spacer(flex-1)가 먼저 줄고, 그래도 넘치면 스크롤로 대응 */}
      <div className="relative flex h-full flex-col overflow-y-auto">
        {/* 뒤로가기 — 좌상단 고정, 스텝 2·3에서만 노출 (본문 세로 중앙 정렬에 영향 없도록 absolute) */}
        {step > 1 && (
          <ButtonIcon
            aria-label="이전 단계로"
            className="absolute top-2 left-4 z-10"
            onClick={() => setStep((step - 1) as Step)}
          >
            <ArrowLeft />
          </ButtonIcon>
        )}

        {/* 타이틀·그래픽 — 하단 컨트롤 위 영역의 세로 중앙에 고정 */}
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
          {/* 스텝 전환 시 가볍게 페이드 인 (시안에 모션 명세 없음) */}
          <div
            key={step}
            className="flex shrink-0 animate-in flex-col items-center duration-300 fade-in-0"
          >
            <div className="flex flex-col gap-4 px-4 text-center">
              {/* 텍스트 섀도 색은 neutral-400 12% (Figma z-index/50 효과) — 섀도 토큰이 없어 값 고정 */}
              <h2 className="text-h3 text-fg-neutral-bold [text-shadow:0_0_20px_rgba(142,150,169,0.12)]">
                {title[0]}
                <br />
                {title[1]}
              </h2>
              <p className="text-h6-1 text-fg-neutral-solid">{subtitle}</p>
            </div>
            {/* 그래픽 영역 343×320 — 시안 annotation상 추후 전부 교체 예정 */}
            <div aria-hidden className="relative h-[320px] w-[343px]">
              <Graphic />
            </div>
          </div>
        </div>

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
                // 하늘 배경 위라 흰색 계열로 — 현재 스텝 흰색, 나머지 50% (Figma 2632-37629)
                s === step
                  ? "w-4 bg-bg-neutral-weak"
                  : "w-2 bg-bg-neutral-weak/50"
              )}
            />
          ))}
        </div>

        <div className="shrink-0 px-4 pt-10 pb-8">
          <ButtonCta
            onClick={step === 3 ? finish : () => setStep((step + 1) as Step)}
          >
            {cta}
          </ButtonCta>
        </div>
      </div>
    </div>
  )
}

/**
 * 첫 진입 온보딩 (Figma 1951-14617 → 1946-12642 → 1946-12687) —
 * 회원가입 완료 팝업의 확인 클릭 시 1회만 노출되는 3단계 풀스크린 안내.
 * 다음/시작하기로 진행, 스텝 2·3에선 뒤로가기 가능.
 *
 * `force: true`면 이미 본 유저에게도 다시 띄운다 — 팟 없는 신규 유저가
 * /pot-start에서 뒤로가기를 눌렀을 때(더 돌아갈 라우트가 없음) 재노출 용도.
 * `onComplete`는 "시작하기"로 정상 종료됐을 때만 호출 — 가입 직후 흐름에서
 * 온보딩이 끝난 뒤에야 다음 화면으로 이동시켜, 지도의 "팟 없음" 가드가
 * 온보딩보다 먼저 끼어들어 팝업·온보딩이 스킵되는 경합을 막는다.
 * 페이지 이동을 반환(Promise)하면 이동이 끝난 뒤에 오버레이를 페이드아웃으로 걷는다 —
 * 먼저 걷으면 아래 깔린 이전 화면(가입 폼)이 다음 화면이 뜰 때까지 잠깐 비친다.
 */
export function openOnboardingOverlay(options?: {
  force?: boolean
  onComplete?: () => void | Promise<void>
}): void {
  // 한 번이라도 노출되면 확인한 것으로 처리 — 재접속 시 다시 노출되지 않음
  if (!options?.force && localStorage.getItem(SEEN_KEY) !== null) {
    options?.onComplete?.()
    return
  }
  localStorage.setItem(SEEN_KEY, "true")

  overlay.open(({ unmount }) => (
    <OnboardingOverlay
      onFinish={() => options?.onComplete?.()}
      unmount={unmount}
    />
  ))
}

/**
 * 계정 삭제 시 노출 이력 초기화 — 안 하면 재가입 시 가입 완료 팝업 뒤
 * openOnboardingOverlay가 "이미 봤음"으로 early-return해 onComplete(지도 이동)가
 * 호출되지 않아 /signup에서 플로우가 멈춘다.
 */
export function resetOnboardingSeen() {
  localStorage.removeItem(SEEN_KEY)
}
