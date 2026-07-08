import * as React from "react"

import type { TravelPot } from "@/entities/travel-pot"
import { ButtonCta } from "@/shared/ui/button-cta"
import { DialogTitle } from "@/shared/ui/dialog"
import { NumberCode } from "@/shared/ui/number-code"
import {
  BottomSheetScreenHeader,
  openBottomSheet,
} from "@/shared/ui/bottom-sheet"
import { openModal } from "@/shared/ui/modal"
import { showToast } from "@/shared/ui/toast"
import { usePotStore } from "@/entities/travel-pot"
import partySrc from "@/shared/assets/party.svg"

const CODE_LENGTH = 6

const JOIN_ERROR_MESSAGES = {
  not_found: "존재하지 않는 코드예요",
  already_joined: "현재 참여중인 여행팟 코드예요",
  full: "정원이 다 찼어요 (6/6)",
} as const

// 시트 CTA(완료) 바로 위에 에러 토스트 노출 (시안 y기준 106px)
const SHEET_TOAST_POSITION = "bottom-[106px]"

function JoinConfirm({
  pot,
  onHome,
  onYes,
}: {
  pot: TravelPot
  onHome: () => void
  onYes: () => void
}) {
  return (
    <>
      <DialogTitle className="py-2 text-center text-h5-1 text-fg-neutral-bold">
        여행팟 정보를 확인해 주세요
      </DialogTitle>
      <div className="flex h-[140px] flex-col items-center justify-center gap-1 rounded-[24px] bg-bg-neutral-subtle">
        <p className="text-h6-1 text-fg-neutral-bold">{pot.name}</p>
        <p className="text-b6 text-fg-neutral-subtle">
          {pot.members.length}명 참여 중
        </p>
      </div>
      <div className="flex w-full gap-3">
        <ButtonCta
          variant="secondary"
          className="w-25 shrink-0"
          onClick={onHome}
        >
          홈으로
        </ButtonCta>
        <ButtonCta onClick={onYes}>맞아요</ButtonCta>
      </div>
    </>
  )
}

function PotJoinSheet({ close }: { close: () => void }) {
  const previewJoin = usePotStore((s) => s.previewJoin)
  const confirmJoin = usePotStore((s) => s.confirmJoin)
  const [code, setCode] = React.useState("")

  const handleDone = () => {
    const result = previewJoin(code)
    if (result.status !== "ok") {
      showToast({
        message: JOIN_ERROR_MESSAGES[result.status],
        showIcon: true,
        className: SHEET_TOAST_POSITION,
      })
      return
    }

    const pot = result.pot
    openModal(
      ({ close: closeConfirm }) => (
        <JoinConfirm
          pot={pot}
          onHome={() => {
            closeConfirm()
            close()
          }}
          onYes={() => {
            confirmJoin(pot)
            closeConfirm()
            close()
            showToast({ message: `${pot.name}에 참여했어요` })
          }}
        />
      ),
      {
        className: "w-[343px] max-w-[calc(100%-2rem)] gap-4 rounded-[32px] p-4",
      }
    )
  }

  return (
    <>
      <BottomSheetScreenHeader
        icon="close"
        title="여행팟 참여"
        onIconClick={close}
      />
      <div className="flex w-full flex-1 flex-col items-center gap-6 px-4">
        <img src={partySrc} alt="" className="size-[60px]" />
        <p className="text-h5-1 text-fg-neutral-bold">
          우리 방의 초대 코드를 입력해주세요
        </p>
        <NumberCode
          length={CODE_LENGTH}
          mode="alphanumeric"
          value={code}
          onChange={setCode}
        />
      </div>
      <div className="w-full px-4 pb-8">
        <ButtonCta disabled={code.length < CODE_LENGTH} onClick={handleDone}>
          완료
        </ButtonCta>
      </div>
    </>
  )
}

/** 여행팟 참여 풀높이 모달 — 초대코드 입력 → 정보 확인 모달 → 참여 완료 토스트. */
export function openPotJoinModal() {
  openBottomSheet(({ close }) => <PotJoinSheet close={close} />, {
    variant: "full",
    showCloseButton: false,
  })
}
