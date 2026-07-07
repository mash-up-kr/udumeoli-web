import * as React from "react"
import confetti from "canvas-confetti"

import { ButtonCta } from "@/shared/ui/button-cta"
import { NumberCode } from "@/shared/ui/number-code"
import { TextField } from "@/shared/ui/text-field"
import {
  BottomSheetScreenHeader,
  openBottomSheet,
} from "@/shared/ui/bottom-sheet"
import { showToast } from "@/shared/ui/toast"
import { usePotStore } from "@/entities/travel-pot"
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
    <>
      <BottomSheetScreenHeader
        icon="close"
        title="여행팟 생성"
        onIconClick={onClose}
      />
      <div className="flex w-full flex-1 flex-col items-center gap-6 px-4">
        <img src={partySrc} alt="" className="size-[60px]" />
        <div className="flex w-full flex-col items-center gap-1">
          <p className="flex items-center justify-center gap-1 text-h5-1 whitespace-nowrap">
            <span className="text-blue-500 underline">{name}</span>
            <span className="text-fg-neutral-bold">
              여행팟 코드가 발급되었어요!
            </span>
          </p>
          <p className="w-full text-center text-b5 text-neutral-500">
            이제 친구를 초대해 같이 지도를 채워볼까요?
          </p>
        </div>
        <NumberCode value={code} readOnly />
      </div>
      <div className="w-full px-4 pb-8">
        <ButtonCta onClick={share}>초대코드 공유하기</ButtonCta>
      </div>
    </>
  )
}

function PotCreateSheet({ close }: { close: () => void }) {
  const createPot = usePotStore((s) => s.createPot)
  const [name, setName] = React.useState("")
  const [created, setCreated] = React.useState<{
    name: string
    code: string
  } | null>(null)

  if (created) {
    return (
      <CreatedStep name={created.name} code={created.code} onClose={close} />
    )
  }

  return (
    <>
      <BottomSheetScreenHeader
        icon="back"
        title="여행팟 생성"
        onIconClick={close}
      />
      <div className="flex w-full flex-1 flex-col px-4">
        <TextField
          label="여행팟 이름"
          placeholder="우리 방의 이름을 입력해주세요."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="w-full px-4 pb-8">
        <ButtonCta
          disabled={!name.trim()}
          onClick={() => {
            const pot = createPot(name.trim())
            setCreated({ name: pot.name, code: pot.inviteCode })
          }}
        >
          다음
        </ButtonCta>
      </div>
    </>
  )
}

/** 여행팟 생성 풀높이 모달 — 이름 입력 → 초대코드 발급(컨페티). */
export function openPotCreateModal() {
  openBottomSheet(({ close }) => <PotCreateSheet close={close} />, {
    variant: "full",
    showCloseButton: false,
  })
}
