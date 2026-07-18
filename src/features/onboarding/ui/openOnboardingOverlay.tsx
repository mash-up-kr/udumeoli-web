import { useState } from "react"
import { overlay } from "overlay-kit"

import { Chip } from "@/shared/ui/chip"
import { cn } from "@/shared/lib/utils"
import iconCameraAddSrc from "@/shared/assets/icon-camera-add.svg"
import iconZoomInoutSrc from "@/shared/assets/icon-zoom-inout.svg"
import photoSeoulSrc from "@/shared/assets/ut-서울.jpg"
import photoYangyangSrc from "@/shared/assets/ut-양양.jpg"
import photoPohangSrc from "@/shared/assets/ut-포항.jpg"

const SEEN_KEY = "photato-onboarding-seen"

const SAMPLE_REGIONS = ["서울", "강릉", "부산"]

// 예시 사진 카드 — 56px · radius 16 · 3px 흰 테두리 (Figma 1300-10145 image Frame)
function PhotoFrame({
  src,
  cropPosition,
  className,
}: {
  src: string
  /** 피사체가 정사각 크롭 안에 들어오도록 object-position 지정 */
  cropPosition: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "absolute block size-14 overflow-hidden rounded-[16px] border-3 border-stroke-neutral-inverse shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]",
        className
      )}
    >
      <img
        src={src}
        alt=""
        className="size-full object-cover"
        style={{ objectPosition: cropPosition }}
      />
    </span>
  )
}

// 아이콘 28px + 안내 문구 2줄 (작은 회색 안내 + 흰색 타이틀)
function StepTitle({
  iconSrc,
  hint,
  title,
}: {
  iconSrc: string
  hint: string
  title: string
}) {
  return (
    <span className="flex items-center gap-4">
      {/* 어두운 단색 에셋을 dim 위에서 흰색으로 반전 */}
      <img src={iconSrc} alt="" className="size-7 brightness-0 invert" />
      <span className="flex flex-col items-start gap-1 whitespace-nowrap">
        <span className="text-h8-1 text-neutral-300">{hint}</span>
        <span className="text-h5 text-white">{title}</span>
      </span>
    </span>
  )
}

function OnboardingOverlay({ unmount }: { unmount: () => void }) {
  const [step, setStep] = useState<1 | 2>(1)

  return (
    <button
      type="button"
      aria-label={step === 1 ? "다음 안내 보기" : "온보딩 닫기"}
      onClick={step === 1 ? () => setStep(2) : unmount}
      className="fixed inset-y-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 bg-neutral-900/80 outline-none"
    >
      {/* Step 1 — 마운트 시 페이드+슬라이드 업, 스텝 전환 시 페이드 아웃 */}
      <span
        aria-hidden={step !== 1}
        className={cn(
          "absolute top-[calc(50%-38px)] left-1/2 flex -translate-x-1/2 -translate-y-1/2 transform-gpu animate-in flex-col items-center gap-4 transition-opacity duration-700 ease-out fade-in-0 slide-in-from-bottom-3",
          // 스텝 2 등장 전에 먼저 완전히 사라지도록 짧게 페이드 아웃
          step !== 1 && "opacity-0 duration-300"
        )}
      >
        <StepTitle
          iconSrc={iconZoomInoutSrc}
          hint="줌인해서"
          title="최근 여행지를 찾아요"
        />
        {/* 아이콘 폭만큼 왼쪽 패딩을 두고 문구 아래 중앙 정렬 (Figma 1259-9425) */}
        <span className="flex w-full items-center justify-center gap-1 pl-8">
          {SAMPLE_REGIONS.map((region) => (
            <Chip key={region} label={region} />
          ))}
        </span>
      </span>

      {/* Step 2 — 처음부터 마운트해 사진을 미리 디코드하고, 전환은 컴포지터에서
          처리되는 opacity/translate 트랜지션만 사용해 버벅임 없이 스르륵 등장 */}
      {/* 안내 영역(상단 320px)과 확인 버튼(하단 246px)을 한 컨테이너로 묶어
          화면 높이가 줄어도 flex 흐름상 서로 겹치지 않게 하고 최소 간격을 보장 */}
      <span
        aria-hidden={step !== 2}
        className={cn(
          "absolute inset-x-0 top-[320px] bottom-[246px] flex transform-gpu flex-col items-center justify-center gap-6 transition-[opacity,translate] duration-700 ease-out",
          // 스텝 1 페이드 아웃(300ms)이 끝난 뒤 등장
          step === 2
            ? "translate-y-0 opacity-100 delay-300"
            : "translate-y-3 opacity-0"
        )}
      >
        {/* 안내 문구 + 예시 사진 — 문구·사진 간 Spacing/x4 (Figma 5_첫진입_2) */}
        <span className="flex flex-col items-center gap-4">
          <StepTitle
            iconSrc={iconCameraAddSrc}
            hint="여행지를 클릭하고"
            title="사진을 업로드해주세요!"
          />
          {/* 예시 사진 3장 — 세 장 모두 세로 중앙(y 30) 정렬, 왼쪽 무회전 x30 ·
              가운데 -4° 중앙(x102) · 오른쪽 +4° x122 (Figma 1300-10145, 컨테이너 204×60) */}
          <span className="relative block h-[60px] w-[204px]">
            <PhotoFrame
              src={photoPohangSrc}
              cropPosition="50% 60%"
              className="top-[2px] left-[122px] rotate-4"
            />
            <PhotoFrame
              src={photoSeoulSrc}
              cropPosition="50% 58%"
              className="top-[2px] left-[30px]"
            />
            <PhotoFrame
              src={photoYangyangSrc}
              cropPosition="48% 70%"
              className="top-[2px] left-1/2 -translate-x-1/2 -rotate-4"
            />
          </span>
        </span>
        {/* 확인했어요 */}
        <span className="rounded-full bg-bg-neutral-weak px-5 py-3 text-h8 whitespace-nowrap text-fg-neutral-bold shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]">
          확인했어요
        </span>
      </span>
    </button>
  )
}

/**
 * 간단 온보딩 (Figma 5_첫진입) — 회원가입 완료 팝업의 확인 클릭 시 1회만 노출.
 * 스텝1(줌인 안내)에서 아무 곳이나 클릭 → 스텝2(업로드 안내),
 * 스텝2는 확인했어요 버튼/배경 클릭 시 닫힘.
 */
export function openOnboardingOverlay(): void {
  // 스텝이 한 번이라도 노출되면 확인한 것으로 처리 — 재접속 시 다시 노출되지 않음
  if (localStorage.getItem(SEEN_KEY) !== null) return
  localStorage.setItem(SEEN_KEY, "true")

  overlay.open(({ unmount }) => <OnboardingOverlay unmount={unmount} />)
}
