import * as React from "react"
import { useRouter } from "@tanstack/react-router"
import { ArrowLeft, ChevronRight } from "lucide-react"
import type { ReactNode } from "react"

import { ButtonIcon } from "@/shared/ui/button-icon"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { openOnboardingOverlay } from "@/features/onboarding"
import { openPotJoinModal } from "@/features/pot-join"
import { usePotStore } from "@/entities/travel-pot"

function StartOptionRow({
  title,
  description,
  onClick,
}: {
  title: ReactNode
  description: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[32px] bg-bg-neutral-weak p-4 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]"
    >
      <span className="size-12 shrink-0 rounded-full bg-bg-neutral-solid" />
      <span className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
        <span className="text-h6 text-fg-neutral-bold">{title}</span>
        <span className="text-b8 text-fg-neutral-subtle">{description}</span>
      </span>
      <ChevronRight className="size-6 shrink-0 text-fg-neutral-subtle" />
    </button>
  )
}

/** 여행팟 시작 온보딩 페이지 — 새 팟 만들기 / 초대코드로 참여하기. (Figma 1893-11882) */
export function PotStartPage() {
  const router = useRouter()
  const hasPot = usePotStore((s) => s.pots.length > 0)
  // 초대코드로 참여해 팟이 생기면(팟 생성은 pot-create가 자체 처리) 곧장 지도로 —
  // replace로 이동해 이 화면이 히스토리에 남아 뒤로가기 시 다시 나타나지 않게 한다
  React.useEffect(() => {
    if (hasPot) router.navigate({ to: "/map-google", replace: true })
  }, [hasPot, router])

  // 이 화면은 항상 팟이 없는 신규 유저가 지도 진입 시 강제 리다이렉트된 것이라
  // "/"·"/map-google" 둘 다 다시 이리로 튕겨와 history.back()으로는 빠져나갈 곳이 없다.
  // 대신 직전에 보고 온 첫 진입 온보딩을 다시 띄운다.
  const goBack = () => openOnboardingOverlay({ force: true })

  return (
    <MobileLayout className="flex min-h-dvh flex-col bg-bg-neutral-subtle">
      <div className="flex w-full items-center px-4 pt-[calc(env(safe-area-inset-top)_+_0.75rem)] pb-3">
        <ButtonIcon aria-label="뒤로 가기" onClick={goBack}>
          <ArrowLeft />
        </ButtonIcon>
      </div>
      <main className="flex flex-1 flex-col px-4">
        <div className="flex flex-col gap-2 py-1">
          <h1 className="text-h3-1 text-fg-neutral-bold">
            친구들과 함께할
            <br />
            여행팟을 시작해요
          </h1>
          <p className="text-b6 text-fg-neutral-subtle">
            직접 새로 만들거나, 초대받은 코드로 들어갈 수 있어요.
          </p>
        </div>
        <div className="flex w-full flex-col gap-4 py-6">
          <StartOptionRow
            title="새 팟 만들기"
            description="우리만의 여행팟을 새로 시작해요."
            onClick={() =>
              router.navigate({ to: "/pot-create", replace: true })
            }
          />
          <StartOptionRow
            title="초대코드로 참여하기"
            description="친구가 보내준 코드를 입력해요."
            onClick={() => openPotJoinModal()}
          />
        </div>
      </main>
    </MobileLayout>
  )
}
