import * as React from "react"
import { overlay } from "overlay-kit"

import { saveRecapImage } from "../lib/save-image"
import { computeRecapStats } from "../lib/stats"

import { useAllPhotos } from "@/entities/photo"
import { selectCurrentPotMembers, usePotStore } from "@/entities/travel-pot"
import { ButtonCta } from "@/shared/ui/button-cta"
import { ButtonIcon } from "@/shared/ui/button-icon"
import { Profile } from "@/shared/ui/profile"
import { showToast } from "@/shared/ui/toast"
import { Tooltip } from "@/shared/ui/tooltip"
import iconArrowLeftSrc from "@/shared/assets/icon-arrow-left.svg"

async function exportRecapImage() {
  try {
    await saveRecapImage()
    showToast({
      message: "이미지가 저장되었어요.",
      icon: "check",
      // CTA 버튼 바로 위 (시안 1745-38757)
      className: "bottom-[106px]",
    })
  } catch {
    showToast({
      message: "이미지 저장을 실패했어요. 다시 시도해 주세요.",
      icon: "alert",
      className: "bottom-[106px]",
    })
  }
}

function RecapOverlay({ unmount }: { unmount: () => void }) {
  const currentPotId = usePotStore((s) => s.currentPotId)
  const potName = usePotStore(
    (s) => s.pots.find((p) => p.id === s.currentPotId)?.name ?? ""
  )
  const members = usePotStore(selectCurrentPotMembers)
  const photos = useAllPhotos(currentPotId)
  const { totalDays, regionCount } = React.useMemo(
    () => computeRecapStats(photos),
    [photos]
  )

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") unmount()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [unmount])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="여행 리캡"
      className="fixed inset-y-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 overflow-hidden"
    >
      {/* 배경 — 지도가 비쳐 보이는 블러(시안의 하늘색~연두색 그라데이션) + 상/하단 흰 그라데이션 */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[18px]" />
        <div className="absolute inset-x-0 top-0 h-[163px] bg-gradient-to-b from-white/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[249px] bg-gradient-to-b from-transparent via-white/60 to-white opacity-90" />
      </div>

      <div className="relative flex h-full flex-col pt-[calc(env(safe-area-inset-top)+16px)] pb-[max(env(safe-area-inset-bottom),33px)]">
        {/* 상단 — 뒤로가기(좌) · 팟 이름 + 멤버 + 툴팁(중앙) */}
        <div className="relative shrink-0 px-4">
          <ButtonIcon
            aria-label="뒤로가기"
            onClick={unmount}
            className="absolute top-0 left-4"
          >
            <img src={iconArrowLeftSrc} alt="" className="size-6" />
          </ButtonIcon>

          <div className="mx-auto flex w-fit flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <p className="text-h3 text-fg-neutral-bold">{potName}</p>
              <div className="flex items-center">
                {members.map((member, index) => (
                  <Profile
                    key={member.id}
                    size="md"
                    src={member.profileImageUrl ?? undefined}
                    alt={`${member.nickname} 프로필`}
                    className={index > 0 ? "-ml-2" : undefined}
                  />
                ))}
              </div>
            </div>
            <Tooltip>
              <span className="text-fg-brand-solid">{totalDays}일</span> 동안{" "}
              <span className="text-fg-brand-solid">
                {regionCount}개의 지역
              </span>
              을 다녀왔어요
            </Tooltip>
          </div>
        </div>

        {/* 리캡 이미지 미리보기 — 임시 placeholder (최종 그래픽은 추후 확정, 시안 #4) */}
        <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-6">
          <div
            role="img"
            aria-label="리캡 이미지 미리보기"
            className="aspect-[270/480] h-full max-h-[480px] rounded-[32px] border border-stroke-neutral-inverse bg-neutral-600 shadow-[0px_0px_10px_0px_white]"
          />
        </div>

        <div className="shrink-0 px-4">
          <ButtonCta onClick={() => void exportRecapImage()}>
            이미지로 내보내기
          </ButtonCta>
        </div>
      </div>
    </div>
  )
}

/**
 * 여행 리캡 화면 (시안 1745-38161) — 지도 위 풀스크린 오버레이(모달).
 * 뒤로가기·ESC로 닫으면 홈(지도)으로 복귀한다.
 */
export function openRecapOverlay(): void {
  overlay.open(({ unmount }) => <RecapOverlay unmount={unmount} />)
}
