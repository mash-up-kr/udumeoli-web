import { useState } from "react"
import { overlay } from "overlay-kit"

import { Chip } from "@/shared/ui/chip"
import iconCameraAddSrc from "@/shared/assets/icon-camera-add.svg"
import iconZoomInoutSrc from "@/shared/assets/icon-zoom-inout.svg"
import sampleSrc from "@/shared/assets/sample.jpeg"

const SEEN_KEY = "photato-onboarding-seen"

const SAMPLE_REGIONS = ["서울", "강릉", "부산"]

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
      {step === 1 ? (
        <span className="absolute top-[calc(50%-38px)] left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4">
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
      ) : (
        <span className="absolute top-[calc(50%-38px)] left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4">
          <StepTitle
            iconSrc={iconCameraAddSrc}
            hint="여행지를 클릭하고"
            title="사진을 업로드해주세요!"
          />
          {/* 예시 사진 3장 — 좌우는 기울이고 가운데가 앞 */}
          <span className="flex items-center pl-8">
            <span className="z-0 -mr-3 -rotate-8 overflow-hidden rounded-2xl border-2 border-stroke-neutral-inverse shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]">
              <img src={sampleSrc} alt="" className="size-14 object-cover" />
            </span>
            <span className="z-10 overflow-hidden rounded-2xl border-2 border-stroke-neutral-inverse shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]">
              <img src={sampleSrc} alt="" className="size-14 object-cover" />
            </span>
            <span className="z-0 -ml-3 rotate-8 overflow-hidden rounded-2xl border-2 border-stroke-neutral-inverse shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]">
              <img src={sampleSrc} alt="" className="size-14 object-cover" />
            </span>
          </span>
          <span className="mt-12 rounded-full bg-bg-neutral-weak px-5 py-3 text-h8 text-fg-neutral-bold shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]">
            확인했어요
          </span>
        </span>
      )}
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
