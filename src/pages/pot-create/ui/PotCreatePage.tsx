import * as React from "react"
import { useRouter } from "@tanstack/react-router"
import { ArrowLeft, X } from "lucide-react"

import { ButtonCta } from "@/shared/ui/button-cta"
import { ButtonIcon } from "@/shared/ui/button-icon"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { TextField } from "@/shared/ui/text-field"
import { Tooltip } from "@/shared/ui/tooltip"
import { showToast } from "@/shared/ui/toast"
import { USE_MOCK } from "@/shared/api/client"
import {
  POT_CAPACITY,
  TicketCard,
  TicketPrintStage,
  useCreateParty,
  usePotStore,
} from "@/entities/travel-pot"
import { useSessionStore } from "@/entities/user"

function CreatedStep({
  name,
  code,
  leaderName,
  onClose,
}: {
  name: string
  code: string
  leaderName: string
  onClose: () => void
}) {
  // 시스템 공유 시트(카톡 등) 노출, 미지원 브라우저는 클립보드 복사로 폴백
  const share = async () => {
    const text = `${name} 여행팟 초대코드: ${code}`
    // 데스크톱 등 Web Share API 미지원 환경 감지 (타입상으론 항상 존재)
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text })
      } catch {
        // 사용자가 공유 시트를 닫은 경우
      }
      return
    }
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // clipboard 미지원 환경에서도 토스트는 노출
    }
    // 최하단 CTA(홈으로, bottom 32=pb-8 + 높이 56) 위 16px — 토스트 위치 규칙(2차 UT)
    showToast({ message: "초대코드를 복사했어요", className: "bottom-[104px]" })
  }

  return (
    // 폼 → 완료 화면 교체가 한 프레임에 일어나 하단 CTA가 위로 '확' 튀어 보인다 — 화면째 페이드인
    <MobileLayout className="relative flex min-h-[var(--app-vh)] animate-in flex-col bg-bg-neutral-subtle duration-300 fade-in-0">
      <div className="flex w-full items-center px-4 pt-[calc(env(safe-area-inset-top)_+_0.75rem)] pb-3">
        <ButtonIcon aria-label="닫기" onClick={onClose}>
          <X />
        </ButtonIcon>
      </div>
      <main className="flex flex-1 flex-col">
        <h1 className="px-4 py-1 text-h3-1 text-fg-neutral-bold">
          {name}
          <br />
          여행팟이 만들어졌어요!
        </h1>
      </main>
      <TicketPrintStage>
        <TicketCard
          name={name}
          leaderName={leaderName}
          seatLabel="01"
          // 기울임은 등장 애니메이션 래퍼(TicketPrintStage)가 담당 — 카드는 정방향으로 인쇄
          className="pointer-events-auto rotate-none"
        >
          <p className="sr-only">초대코드 {code}</p>
          <div aria-hidden="true" className="flex gap-[6px]">
            {code
              .slice(0, 6)
              .split("")
              .map((char, i) => (
                <span
                  key={i}
                  className="flex h-[34px] w-[28px] items-center justify-center rounded-[8px] border border-neutral-200 bg-neutral-100 font-eng text-e3 text-neutral-900"
                >
                  {char}
                </span>
              ))}
          </div>
          <p className="text-h9 text-neutral-900">
            함께 여행할 친구들을 초대해 보세요!
          </p>
        </TicketCard>
      </TicketPrintStage>
      <div className="flex w-full flex-col items-center gap-[25px] px-4 pb-8">
        {/* 최대 인원 안내 — 첫 생성 후 상시 노출, 자동 사라짐 없음 (Figma 1374-173 #7-2) */}
        <Tooltip direction="bottom">
          최대 6명까지 함께할 수 있어요. (1/6)
        </Tooltip>
        <div className="flex w-full flex-col gap-[10px]">
          <ButtonCta onClick={share}>초대코드 공유하기</ButtonCta>
          <ButtonCta
            variant="secondary"
            className="shadow-[0px_0px_10px_0px_rgba(142,150,169,0.12)]"
            onClick={onClose}
          >
            홈으로
          </ButtonCta>
        </div>
      </div>
    </MobileLayout>
  )
}

/** 여행팟 생성 페이지 — 이름 입력 → 티켓 완료 화면. (Figma 1893-12129, 완료 화면 2588-38543) */
export function PotCreatePage() {
  const router = useRouter()
  const createPot = usePotStore((s) => s.createPot)
  const createPartyMutation = useCreateParty()
  const currentUser = useSessionStore((s) => s.currentUser)
  const [name, setName] = React.useState("")
  const [created, setCreated] = React.useState<{
    name: string
    code: string
  } | null>(null)

  // 완료 화면의 닫기·홈으로는 진입 지점(팟 목록 드롭다운/여행팟 시작 온보딩)과 무관하게 항상 지도로 이동.
  // replace — 팟 생성 플로우(이름 입력~완료) 전체를 히스토리에서 걷어내 뒤로가기가
  // 이 화면들로 되돌아가지 않고 바로 이전 맥락(로그인 유저와 동일)으로 향하게 한다
  const goToMap = () => router.navigate({ to: "/map-google", replace: true })
  // 이름 입력 화면의 뒤로가기는 실제 진입 지점(지도 드롭다운/여행팟 시작 온보딩)으로 돌아가야 하므로 history back 사용
  const goBack = () => router.history.back()

  const isCreating = createPartyMutation.isPending

  const handleCreate = async () => {
    const trimmedName = name.trim()
    if (!trimmedName || isCreating) return

    try {
      // 세션 유저를 생성자 멤버로 전달 — 새 팟에서도 내 슬롯이 인식되도록
      const pot = USE_MOCK
        ? createPot(trimmedName, {
            id: currentUser?.id ?? "me",
            nickname: currentUser?.nickname ?? "나",
            profileImageUrl: currentUser?.profileImageUrl ?? null,
          })
        : await createPartyMutation.mutateAsync(trimmedName)

      setCreated({ name: pot.name, code: pot.inviteCode })
    } catch {
      showToast({ message: "여행팟 생성에 실패했어요", icon: "alert" })
    }
  }

  if (created) {
    return (
      <CreatedStep
        name={created.name}
        code={created.code}
        leaderName={currentUser?.nickname ?? "나"}
        onClose={() => {
          goToMap()
          // 새 팟은 지도 안내 오버레이가 먼저 뜨는 첫 진입이라 기본 위치(하단 34) (Figma 3065-19291 #10)
          showToast({
            message: `${created.name}에 참여했어요 (1/${POT_CAPACITY})`,
            icon: "check",
          })
        }}
      />
    )
  }

  return (
    <MobileLayout className="flex min-h-[var(--app-vh)] animate-in flex-col bg-bg-neutral-subtle duration-300 fade-in-0">
      <div className="flex w-full items-center px-4 pt-[calc(env(safe-area-inset-top)_+_0.75rem)] pb-3">
        <ButtonIcon aria-label="뒤로 가기" onClick={goBack}>
          <ArrowLeft />
        </ButtonIcon>
      </div>
      <form
        className="flex flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault()
          void handleCreate()
        }}
      >
        <main className="flex flex-1 flex-col gap-6 px-4">
          <h1 className="text-h3-1 text-fg-neutral-bold">
            새로운 팟 이름을
            <br />
            정해 주세요
          </h1>
          <TextField
            label="여행팟 이름"
            placeholder="우리 팟의 이름을 입력해주세요."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </main>
        <div className="w-full px-4 pb-8">
          <ButtonCta
            type="button"
            disabled={!name.trim() || isCreating}
            onClick={() => void handleCreate()}
          >
            {isCreating ? "생성 중..." : "팟 만들기"}
          </ButtonCta>
        </div>
      </form>
    </MobileLayout>
  )
}
