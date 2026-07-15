import * as React from "react"

import type { TravelPot } from "@/entities/travel-pot"
import { ButtonCta } from "@/shared/ui/button-cta"
import { DialogTitle } from "@/shared/ui/dialog"
import { Chip } from "@/shared/ui/chip"
import { NumberCode } from "@/shared/ui/number-code"
import { DEFAULT_PROFILE_SRC } from "@/shared/ui/profile"
import {
  BottomSheetScreenHeader,
  openBottomSheet,
} from "@/shared/ui/bottom-sheet"
import { openModal } from "@/shared/ui/modal"
import { showToast } from "@/shared/ui/toast"
import { useAllPhotos } from "@/entities/photo"
import { usePotStore } from "@/entities/travel-pot"
import partySrc from "@/shared/assets/party.svg"

const CODE_LENGTH = 6

// 여행팟 최대 인원 — 6명 고정 (Figma 여행팟 정보 확인 팝업)
const POT_CAPACITY = 6

const JOIN_ERROR_MESSAGES = {
  not_found: "존재하지 않는 코드예요",
  already_joined: "현재 참여중인 여행팟 코드예요",
  full: "정원이 다 찼어요 (6/6)",
} as const

// 시트 CTA(완료) 바로 위에 에러 토스트 노출 (시안 y기준 106px)
const SHEET_TOAST_POSITION = "bottom-[106px]"

// 참여 완료 토스트는 지도 하단 캐러셀 위 16px (시안 #1048-5977: 34 + 카드 192 + 16)
const MAP_TOAST_POSITION = "bottom-[242px]"

// 캐러셀(image-card-pattern)이 없는 첫 참여 상태에서는 하단 62px (시안 9_토스트_여행팟참여완료)
const MAP_TOAST_POSITION_EMPTY = "bottom-[62px]"

function JoinConfirm({
  pot,
  onRetry,
  onYes,
}: {
  pot: TravelPot
  onRetry: () => void
  onYes: () => void
}) {
  return (
    <>
      <DialogTitle className="py-2 text-center text-h5-1 text-fg-neutral-bold">
        여행팟 정보를 확인해 주세요
      </DialogTitle>
      {/* 여행팟 정보 카드 — 팟 이름 + n/6명 칩 + 참여자 칩 리스트 (Figma 1176-8912) */}
      <div className="w-full rounded-[12px] bg-bg-neutral-subtle pb-3">
        <div className="flex w-full items-center justify-between gap-2 p-3">
          <p className="min-w-0 truncate text-h5 text-fg-neutral-bold">
            {pot.name}
          </p>
          <Chip
            label={`${pot.members.length}/${POT_CAPACITY}명`}
            className="shrink-0"
          />
        </div>
        {/* 참여자는 한 줄 최대 3명 — 초과분은 다음 줄 (최대 6명 = 2줄) */}
        <div className="grid w-full grid-cols-3 justify-items-center">
          {pot.members.map((member) => (
            <Chip
              key={member.id}
              label={member.nickname}
              profileSrc={member.profileImageUrl ?? DEFAULT_PROFILE_SRC}
              className="bg-transparent shadow-none"
            />
          ))}
        </div>
      </div>
      <div className="flex w-full gap-3">
        <ButtonCta
          variant="secondary"
          className="w-25 shrink-0"
          onClick={onRetry}
        >
          다시 입력
        </ButtonCta>
        <ButtonCta onClick={onYes}>맞아요</ButtonCta>
      </div>
    </>
  )
}

function PotJoinSheet({ close }: { close: () => void }) {
  const previewJoin = usePotStore((s) => s.previewJoin)
  const confirmJoin = usePotStore((s) => s.confirmJoin)
  // 사진이 하나도 없으면 지도 하단 캐러셀이 안 떠서 완료 토스트를 아래로 내림
  const currentPotId = usePotStore((s) => s.currentPotId)
  const hasRegionCards = useAllPhotos(currentPotId).length > 0
  const [code, setCode] = React.useState("")
  // 코드 검증 실패 시 에러 테두리 — 다시 입력하면 해제
  const [codeError, setCodeError] = React.useState(false)

  const handleDone = () => {
    const result = previewJoin(code)
    if (result.status !== "ok") {
      setCodeError(true)
      showToast({
        message: JOIN_ERROR_MESSAGES[result.status],
        icon: "alert",
        className: SHEET_TOAST_POSITION,
      })
      return
    }

    const pot = result.pot
    openModal(
      ({ close: closeConfirm }) => (
        <JoinConfirm
          pot={pot}
          onRetry={() => {
            // 다시 입력 — 이전 화면 복귀 + 코드 초기화 (X 닫기는 코드 유지)
            setCode("")
            setCodeError(false)
            closeConfirm()
          }}
          onYes={() => {
            confirmJoin(pot)
            closeConfirm()
            close()
            showToast({
              // 인원 수는 나를 포함한 값
              message: `${pot.name}에 참여했어요 (${pot.members.length + 1}/${POT_CAPACITY})`,
              icon: "check",
              className: hasRegionCards
                ? MAP_TOAST_POSITION
                : MAP_TOAST_POSITION_EMPTY,
            })
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
          error={codeError}
          onChange={(next) => {
            setCode(next)
            setCodeError(false)
          }}
        />
      </div>
      <div className="w-full px-4 pb-[34px]">
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
