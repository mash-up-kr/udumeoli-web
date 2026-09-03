import { useRef, useState } from "react"
import { overlay } from "overlay-kit"

import phoneMapSrc from "../assets/phone-map.jpg"
import photoAlleySrc from "../assets/photo-alley.jpg"
import photoBeachSrc from "../assets/photo-beach.jpg"
import photoNightSrc from "../assets/photo-night.jpg"
import stickerActivitySrc from "@/shared/assets/map-stickers/activity.png"
import stickerDessertSrc from "@/shared/assets/map-stickers/dessert.png"
import stickerFoodSrc from "@/shared/assets/map-stickers/food.png"
import stickerHealingSrc from "@/shared/assets/map-stickers/healing.png"
import stickerPhotoSrc from "@/shared/assets/map-stickers/photo.png"
import skyBackgroundSrc from "@/shared/assets/sky-background.png"
import { cn } from "@/shared/lib/utils"
import { ButtonCta } from "@/shared/ui/button-cta"

const SEEN_KEY = "photato-onboarding-seen"

type Step = 1 | 2 | 3

// 스텝별 카피 (Figma 2632-37599 · 2632-37636 · 2632-37661) — CTA는 마지막 스텝 포함 전부 "다음"
const STEP_CONTENT = [
  {
    title: ["여행을 대표하는", "스티커를 골라요"],
    subtitle: "이번 여행, 한 가지 스티커로 정의한다면?",
  },
  {
    title: ["우리만의 여행 지도가", "만들어지는 중"],
    subtitle: "여행 후, 지도 위에 스티커로 추억을 기록해요",
  },
  {
    title: ["쉽게 기록하는", "우리의 여행 갤러리"],
    subtitle: "대표 사진으로 우리만의 갤러리를 만들어요",
  },
] as const

// 스텝1 스티커 칩 — 그래픽 안 장식 요소. left/top은 칩 중심 좌표(343×343 기준)
function StickerChip({
  iconSrc,
  label,
  inverse = false,
  className,
}: {
  iconSrc: string
  label: string
  /** 어두운 배경(디저트 칩) 변형 */
  inverse?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        // w-max: absolute 요소의 shrink-to-fit이 컨테이너 우측 edge에 막혀
        // 배경 pill이 글자보다 좁아지는 것 방지 (액티비티 칩)
        "absolute flex w-max -translate-x-1/2 -translate-y-1/2 items-center gap-[3px] rounded-full px-[14px] py-[7px] whitespace-nowrap shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]",
        inverse
          ? "bg-bg-neutral-inverse text-fg-neutral-inverse"
          : "bg-bg-neutral-weak/70 text-fg-neutral-bold",
        className
      )}
    >
      {/* object-cover: food.png만 4:3이라 정사각 슬롯에 맞춰 크롭 (시안도 중앙 크롭) */}
      <img src={iconSrc} alt="" className="size-10 object-cover" />
      {/* 그래픽 전용 스케일 텍스트(21.95px) — 타이포 토큰에 없는 아트워크 크기라 값 고정 */}
      <span className="text-[22px] leading-[33px] font-bold tracking-[-0.18px]">
        {label}
      </span>
    </span>
  )
}

// 스텝1 그래픽 — 자수 스티커 칩 5종 (Figma 2632-37611)
function StickerGraphic() {
  return (
    <>
      <StickerChip
        iconSrc={stickerDessertSrc}
        label="디저트"
        inverse
        className="top-[125px] left-[232px] rotate-[2.4deg]"
      />
      <StickerChip
        iconSrc={stickerActivitySrc}
        label="액티비티"
        className="top-[231px] left-[235px] rotate-[-2.9deg]"
      />
      <StickerChip
        iconSrc={stickerFoodSrc}
        label="맛집"
        className="top-[63px] left-[121px] rotate-[-6.9deg]"
      />
      <StickerChip
        iconSrc={stickerPhotoSrc}
        label="감성"
        className="top-[175px] left-[99px] rotate-[6.7deg]"
      />
      <StickerChip
        iconSrc={stickerHealingSrc}
        label="힐링"
        className="top-[307px] left-[143px] rotate-[4.3deg]"
      />
    </>
  )
}

// 스텝2 그래픽 — 앱 지도 화면 폰 목업 (Figma 2632-37648). 폰 하단은 그래픽 영역(343)
// 밖으로 이어지다 overflow-clip으로 잘리는 시안 그대로 재현.
// mask로 하단을 서서히 투명하게 — 시안처럼 폰이 배경 하늘로 녹아든다
function MapGraphic() {
  return (
    <div className="absolute inset-0 overflow-clip rounded-[32px] [mask-image:linear-gradient(to_bottom,black_62%,transparent_97%)]">
      <div className="absolute top-10 left-1/2 h-[322px] w-[227px] -translate-x-1/2 overflow-hidden rounded-t-[29px]">
        {/* 스크린샷이 테두리 밑까지 깔리고 흰 테두리가 그 위에 얹히는 구조 (Figma stroke는 fill 위에 그려짐) */}
        <img
          src={phoneMapSrc}
          alt=""
          className="absolute top-[-39px] left-0 w-full"
        />
        <div
          aria-hidden
          className="absolute inset-0 rounded-t-[29px] border-7 border-b-0 border-stroke-neutral-inverse"
        />
      </div>
    </div>
  )
}

// 스텝3 사진 프레임 — 128×154 · radius 26 · 불투명 흰 7px 테두리(사진이 비치면 안 됨).
// left/top은 프레임 중심 좌표(343×343 기준)
function PhotoFrame({ src, className }: { src: string; className?: string }) {
  return (
    <span
      className={cn(
        "absolute block h-[154px] w-[128px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[26px] shadow-[0px_0px_32px_0px_rgba(142,150,169,0.12)]",
        className
      )}
    >
      <img src={src} alt="" className="size-full object-cover" />
      <span
        aria-hidden
        className="absolute inset-0 rounded-[26px] border-7 border-stroke-neutral-inverse"
      />
    </span>
  )
}

// 스텝3 그래픽 — 사진 콜라주 + 장식 스티커 3종 (Figma 2632-37673).
// 클로버는 시안대로 왼쪽 edge에서 잘리도록 overflow-clip 유지
function GalleryGraphic() {
  return (
    <div className="absolute inset-0 overflow-clip rounded-[32px]">
      <PhotoFrame
        src={photoBeachSrc}
        className="top-[244px] left-[236px] rotate-[4.8deg]"
      />
      <PhotoFrame
        src={photoNightSrc}
        className="top-[198px] left-[111px] rotate-[-10.4deg]"
      />
      <PhotoFrame
        src={photoAlleySrc}
        className="top-[118px] left-[182px] rotate-[1.9deg]"
      />
      <img
        src={stickerPhotoSrc}
        alt=""
        className="absolute top-[85px] left-[249px] w-[85px] -translate-x-1/2 -translate-y-1/2 rotate-[15deg]"
      />
      <img
        src={stickerDessertSrc}
        alt=""
        className="absolute top-[204px] left-[293px] w-[90px] -translate-x-1/2 -translate-y-1/2 rotate-[-8.9deg]"
      />
      <img
        src={stickerHealingSrc}
        alt=""
        className="absolute top-[168px] left-[38px] w-[91px] -translate-x-1/2 -translate-y-1/2 rotate-[-21deg]"
      />
    </div>
  )
}

const STEP_GRAPHICS = [StickerGraphic, MapGraphic, GalleryGraphic]

function OnboardingOverlay({
  onFinish,
  unmount,
}: {
  /** 마지막 스텝 "다음" — 다음 화면 이동. 끝나면 오버레이가 페이드아웃 후 걷힌다 */
  onFinish: () => void | Promise<void>
  unmount: () => void
}) {
  const [step, setStep] = useState<Step>(1)
  const [closing, setClosing] = useState(false)
  const { title, subtitle } = STEP_CONTENT[step - 1]
  const Graphic = STEP_GRAPHICS[step - 1]
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const goNext = () => {
    if (step === 3) void finish()
    else setStep((step + 1) as Step)
  }

  // 모바일 사용자가 "다음" 버튼 대신 좌우 스와이프로 넘기려는 행동 대응 —
  // 버튼은 그대로 두고 스와이프를 추가 입력으로 받는다
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null || closing) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    touchStart.current = null
    // 세로 스크롤·탭과 구분: 가로 이동이 우세하고 48px 이상일 때만 스와이프로 인정
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return
    // 스와이프는 스텝 1~3 사이 이동만 — 마지막 스텝의 완료(다음 화면 이동)는 버튼 전용
    if (dx < 0 && step < 3) setStep((step + 1) as Step)
    else if (dx > 0 && step > 1) setStep((step - 1) as Step)
  }

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

      {/* 낮은 화면에서는 spacer(flex-1)가 먼저 줄고, 그래도 넘치면 스크롤로 대응.
          343px 그래픽이 더 좁은 화면에서 가로 스크롤을 만들지 않게 x는 잘라낸다 */}
      <div
        className="relative flex h-full flex-col overflow-x-hidden overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* 타이틀·그래픽 — 하단 컨트롤 위 영역의 세로 중앙에 고정 */}
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
          {/* 스텝 전환 시 가볍게 페이드 인 (시안에 모션 명세 없음) */}
          <div
            key={step}
            className="flex shrink-0 animate-in flex-col items-center duration-300 fade-in-0"
          >
            <div className="flex flex-col gap-4 px-4 text-center">
              {/* 텍스트 섀도 색은 neutral-400 12% (Figma z-index/50 효과) — 섀도 토큰이 없어 값 고정 */}
              <h2 className="text-h2 text-fg-neutral-bold [text-shadow:0_0_20px_rgba(142,150,169,0.12)]">
                {title[0]}
                <br />
                {title[1]}
              </h2>
              <p className="text-b4 text-fg-neutral-solid">{subtitle}</p>
            </div>
            {/* 그래픽 영역 343×343 (Figma Graphic 프레임) */}
            <div aria-hidden className="relative size-[343px]">
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
          {/* 마지막 스텝도 시안대로 "다음" (Figma 2632-37688) */}
          <ButtonCta onClick={goNext}>다음</ButtonCta>
        </div>
      </div>
    </div>
  )
}

/**
 * 첫 진입 온보딩 (Figma 2632-37599 → 2632-37636 → 2632-37661) —
 * 회원가입 완료 팝업의 확인 클릭 시 1회만 노출되는 3단계 풀스크린 안내.
 * "다음" 또는 왼쪽 스와이프로 진행(완료는 버튼 전용), 스텝 2·3에선 오른쪽 스와이프로 되돌아갈 수 있다.
 *
 * `force: true`면 이미 본 유저에게도 다시 띄운다 — 팟 없는 신규 유저가
 * /pot-start에서 뒤로가기를 눌렀을 때(더 돌아갈 라우트가 없음) 재노출 용도.
 * `onComplete`는 마지막 스텝 "다음"으로 정상 종료됐을 때만 호출 — 가입 직후 흐름에서
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
