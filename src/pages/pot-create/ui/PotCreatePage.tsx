import * as React from "react"
import { useRouter } from "@tanstack/react-router"
import confetti from "canvas-confetti"
import { ArrowLeft, X } from "lucide-react"

import { ButtonCta } from "@/shared/ui/button-cta"
import { ButtonIcon } from "@/shared/ui/button-icon"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { NumberCode } from "@/shared/ui/number-code"
import { TextField } from "@/shared/ui/text-field"
import { Tooltip } from "@/shared/ui/tooltip"
import { showToast } from "@/shared/ui/toast"
import { USE_MOCK } from "@/shared/api/client"
import { useCreateParty, usePotStore } from "@/entities/travel-pot"
import { useSessionStore } from "@/entities/user"
import partySrc from "@/shared/assets/party.svg"

function CreatedStep({
  name,
  code,
  onClose,
}: {
  name: string
  code: string
  onClose: () => void
}) {
  // 코드 발급 축하 컨페티 (진입 시 1회)
  React.useEffect(() => {
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.3 } })
  }, [])

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
    showToast({ message: "초대코드를 복사했어요" })
  }

  return (
    <MobileLayout className="flex min-h-dvh flex-col bg-bg-neutral-subtle">
      <div className="flex w-full items-center px-4 pt-[calc(env(safe-area-inset-top)_+_0.75rem)] pb-3">
        <ButtonIcon aria-label="닫기" onClick={onClose}>
          <X />
        </ButtonIcon>
      </div>
      <main className="flex flex-1 flex-col gap-4 px-4">
        <img src={partySrc} alt="" className="size-[60px]" />
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-col">
            <p className="text-h3-1 text-fg-brand-solid underline">{name}</p>
            <p className="text-h3-1 text-fg-neutral-bold">
              여행팟 코드가 발급되었어요!
            </p>
          </div>
          <p className="text-b6 text-fg-neutral-subtle">
            이제 친구를 초대해 같이 지도를 채워볼까요?
          </p>
        </div>
        <div className="flex w-full justify-center">
          <NumberCode value={code} readOnly />
        </div>
      </main>
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

/** 여행팟 생성 페이지 — 이름 입력 → 초대코드 발급(컨페티). (Figma 1893-12129) */
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
      <CreatedStep name={created.name} code={created.code} onClose={goToMap} />
    )
  }

  return (
    <MobileLayout className="flex min-h-dvh flex-col bg-bg-neutral-subtle">
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
