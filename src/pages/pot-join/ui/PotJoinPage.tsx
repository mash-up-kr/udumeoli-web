import * as React from "react"
import { useRouter } from "@tanstack/react-router"
import { ArrowLeft, X } from "lucide-react"

import type { PotMember, TravelPot } from "@/entities/travel-pot"
import { ButtonCta } from "@/shared/ui/button-cta"
import { ButtonIcon } from "@/shared/ui/button-icon"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { NumberCode } from "@/shared/ui/number-code"
import { DEFAULT_PROFILE_SRC, Profile } from "@/shared/ui/profile"
import { showToast } from "@/shared/ui/toast"
import { USE_MOCK, getGraphQLErrorCode } from "@/shared/api/client"
import { useAllPhotos } from "@/entities/photo"
import {
  TicketCard,
  fetchPartyPreview,
  useJoinParty,
  usePotStore,
} from "@/entities/travel-pot"
import { useSessionStore } from "@/entities/user"

// [정책 1893-21176 #2] 영문+숫자 혼용 6자리 고정 입력
const CODE_LENGTH = 6

// 여행팟 최대 인원 — 6명 고정 (정책 1893-21176 #6·#7)
const POT_CAPACITY = 6

// [정책 1893-21176 #4·#5·#6] 에러 토스트 문구 — 3초 노출은 토스트 기본 duration
const JOIN_ERROR_MESSAGES = {
  not_found: "존재하지 않는 코드예요",
  already_joined: "현재 참여중인 여행팟 코드예요",
  full: "정원이 다 찼어요 (6/6)",
} as const

const JOIN_CODE_MESSAGES: Record<string, string> = {
  INVALID_INVITE_CODE: JOIN_ERROR_MESSAGES.not_found,
  ALREADY_JOINED_PARTY: JOIN_ERROR_MESSAGES.already_joined,
  PARTY_FULL: JOIN_ERROR_MESSAGES.full,
  RATE_LIMITED: "잠시 후 다시 시도해 주세요",
}

// 코드 입력 CTA(참여하기) 바로 위에 에러 토스트 노출 (시안 y기준 106px)
const CODE_TOAST_POSITION = "bottom-[106px]"

// 참여 완료 토스트는 지도 하단 캐러셀 위 16px (시안 #1048-5977: 34 + 카드 192 + 16)
const MAP_TOAST_POSITION = "bottom-[242px]"

// 캐러셀(image-card-pattern)이 없는 첫 참여 상태에서는 하단 62px (시안 9_토스트_여행팟참여완료)
const MAP_TOAST_POSITION_EMPTY = "bottom-[62px]"

interface JoinPreview {
  name: string
  memberCount: number
  members: Array<PotMember>
  /** 목 플로우에서 confirmJoin에 넘길 팟 — 실서버 플로우는 null. */
  mockPot: TravelPot | null
}

/** 참여 확인 스텝 — 티켓 카드로 팟 정보 노출. (Figma 2588-37965) */
function ConfirmStep({
  code,
  preview,
  joinPending,
  onClose,
  onRetry,
  onConfirm,
}: {
  code: string
  preview: JoinPreview
  joinPending: boolean
  onClose: () => void
  onRetry: () => void
  onConfirm: () => void
}) {
  return (
    // 시안 배경 #eff1f5 = neutral-100 (bg-neutral-solid) — 흰 티켓이 도드라지도록 입력 스텝보다 한 단계 진함
    <MobileLayout className="flex min-h-dvh animate-in flex-col bg-bg-neutral-solid duration-300 fade-in-0">
      <div className="flex w-full items-center px-4 pt-[calc(env(safe-area-inset-top)_+_0.75rem)] pb-3">
        <ButtonIcon aria-label="닫기" onClick={onClose}>
          <X />
        </ButtonIcon>
      </div>
      <main className="flex flex-1 flex-col">
        <h1 className="px-4 py-1 text-h3-1 text-fg-neutral-bold">
          아래 여행팟이 맞는지
          <br />
          확인해 주세요
        </h1>
        {/* 시안 2588-37996: 티켓 상단 여백 32px */}
        <div className="flex h-[375px] w-full justify-center">
          <TicketCard
            name={preview.name}
            // preview 응답에 리더 필드가 없다 — 서버가 owner를 먼저 내려주는 순서에 의존해 첫 멤버 표기
            leaderName={preview.members.at(0)?.nickname ?? "-"}
            // 내가 앉을 자리 = 현재 인원 + 1
            seatLabel={String(preview.memberCount + 1).padStart(2, "0")}
            className="mt-[32px]"
          >
            <p className="sr-only">초대코드 {code}</p>
            {/* 코드 6칸 축소판 — 생성 완료 티켓 셀의 0.588배 (시안 2588-38033) */}
            <div aria-hidden="true" className="flex gap-[3.5px]">
              {code
                .slice(0, CODE_LENGTH)
                .split("")
                .map((char, i) => (
                  <span
                    key={i}
                    className="flex h-5 w-[16.5px] items-center justify-center rounded-[5px] border border-neutral-200 bg-neutral-100 font-eng text-[9px] leading-none text-neutral-900"
                  >
                    {char}
                  </span>
                ))}
            </div>
            <ul className="flex flex-wrap items-center gap-x-[9px] gap-y-px">
              {preview.members.map((member) => (
                <li key={member.id} className="flex items-center gap-1">
                  <Profile
                    size="xs"
                    src={member.profileImageUrl ?? DEFAULT_PROFILE_SRC}
                    alt=""
                  />
                  {/* 12px/20px SemiBold — 대응 타이포 토큰 부재로 시안 수치 직접 지정 */}
                  <span className="text-[12px] leading-5 font-semibold tracking-[-0.1px] text-neutral-900">
                    {member.nickname}
                  </span>
                </li>
              ))}
            </ul>
          </TicketCard>
        </div>
      </main>
      <div className="flex w-full gap-[10px] px-4 pb-8">
        <ButtonCta
          variant="secondary"
          className="w-[116px] shrink-0"
          onClick={onRetry}
        >
          다시 입력
        </ButtonCta>
        <ButtonCta disabled={joinPending} onClick={onConfirm}>
          {joinPending ? "참여 중..." : "맞아요"}
        </ButtonCta>
      </div>
    </MobileLayout>
  )
}

/**
 * 초대코드로 여행팟 참여 페이지 — 코드 입력 → 티켓으로 팟 확인 → 참여 확정.
 * (Figma 코드 입력 1893-12640 · 참여 확인 2588-37965 · 정책 1893-21176)
 */
export function PotJoinPage() {
  const router = useRouter()
  const previewJoin = usePotStore((s) => s.previewJoin)
  const confirmJoin = usePotStore((s) => s.confirmJoin)
  const joinPartyMutation = useJoinParty()
  // 사진이 하나도 없으면 지도 하단 캐러셀이 안 떠서 완료 토스트를 아래로 내림
  const currentPotId = usePotStore((s) => s.currentPotId)
  const hasRegionCards = useAllPhotos(currentPotId).length > 0
  const currentUser = useSessionStore((s) => s.currentUser)
  const [code, setCode] = React.useState("")
  // [정책 #3] 검증 실패 시 에러 테두리 + CTA 비활성 — 다시 입력하면 해제
  const [codeError, setCodeError] = React.useState(false)
  const [previewLoading, setPreviewLoading] = React.useState(false)
  // 참여 확인 스텝 데이터 — 있으면 확인 화면, 없으면 코드 입력 화면
  const [preview, setPreview] = React.useState<JoinPreview | null>(null)

  // 뒤로가기 — 실제 진입 지점(팟 시작 온보딩/지도 드롭다운)으로 복귀 [정책 #1]
  const goBack = () => router.history.back()
  // 참여 확정 시 팟의 여행 지도로 이동 [정책 #9] — replace로 참여 플로우를 히스토리에서 걷어낸다
  const goToMap = () => router.navigate({ to: "/map-google", replace: true })

  const showJoinedToast = (pot: TravelPot, memberCount: number) => {
    // [정책 #10] "OOO에 참여했어요 (n/6)" — 지도 진입 화면 위 3초 노출
    showToast({
      message: `${pot.name}에 참여했어요 (${memberCount}/${POT_CAPACITY})`,
      icon: "check",
      className: hasRegionCards ? MAP_TOAST_POSITION : MAP_TOAST_POSITION_EMPTY,
    })
  }

  const showJoinError = (error: unknown) => {
    setCodeError(true)
    const errorCode = getGraphQLErrorCode(error)
    showToast({
      message:
        (errorCode && JOIN_CODE_MESSAGES[errorCode]) ||
        "초대코드를 확인해 주세요",
      icon: "alert",
      className: CODE_TOAST_POSITION,
    })
  }

  // [정책 #3] 참여하기 — 코드 유효성 검사 후 확인 스텝으로 전환
  const handleSubmit = async () => {
    if (USE_MOCK) {
      const result = previewJoin(code, currentUser?.id)
      if (result.status !== "ok") {
        setCodeError(true)
        showToast({
          message: JOIN_ERROR_MESSAGES[result.status],
          icon: "alert",
          className: CODE_TOAST_POSITION,
        })
        return
      }
      setPreview({
        name: result.pot.name,
        memberCount: result.pot.members.length,
        members: result.pot.members,
        mockPot: result.pot,
      })
      return
    }

    setPreviewLoading(true)
    try {
      const data = await fetchPartyPreview(code)
      setPreview({ ...data, mockPot: null })
    } catch (error) {
      showJoinError(error)
    } finally {
      setPreviewLoading(false)
    }
  }

  // [정책 #9] 맞아요 — 참여 확정 후 지도 이동 + 완료 토스트
  const handleConfirm = async () => {
    const current = preview
    if (!current) return

    if (current.mockPot) {
      confirmJoin(current.mockPot, {
        id: currentUser?.id ?? "me",
        nickname: currentUser?.nickname ?? "나",
        profileImageUrl: currentUser?.profileImageUrl ?? null,
      })
      goToMap()
      // 인원 수는 나를 포함한 값
      showJoinedToast(current.mockPot, current.mockPot.members.length + 1)
      return
    }

    try {
      // 캐시·store 반영은 useJoinParty의 onSuccess가 처리한다
      const pot = await joinPartyMutation.mutateAsync(code)
      goToMap()
      showJoinedToast(pot, pot.members.length)
    } catch (error) {
      // 확정 중 정원 초과 등 — 코드 입력 스텝으로 복귀 후 에러 노출
      setPreview(null)
      showJoinError(error)
    }
  }

  if (preview) {
    return (
      <ConfirmStep
        code={code}
        preview={preview}
        joinPending={joinPartyMutation.isPending}
        // X 닫기 — 코드 입력 화면 복귀, 입력값 유지 (다시 입력과 달리 초기화 없음)
        onClose={() => setPreview(null)}
        // [정책 #8] 다시 입력 — 코드 입력 화면 복귀 + 입력값 초기화
        onRetry={() => {
          setCode("")
          setCodeError(false)
          setPreview(null)
        }}
        onConfirm={() => void handleConfirm()}
      />
    )
  }

  return (
    <MobileLayout className="flex min-h-dvh animate-in flex-col bg-bg-neutral-subtle duration-300 fade-in-0">
      <div className="flex w-full items-center px-4 pt-[calc(env(safe-area-inset-top)_+_0.75rem)] pb-3">
        <ButtonIcon aria-label="뒤로 가기" onClick={goBack}>
          <ArrowLeft />
        </ButtonIcon>
      </div>
      <main className="flex flex-1 flex-col gap-6 px-4">
        <h1 className="text-h3-1 text-fg-neutral-bold">
          우리 팟의 초대코드를
          <br />
          입력해 주세요
        </h1>
        <NumberCode
          length={CODE_LENGTH}
          mode="alphanumeric"
          value={code}
          error={codeError}
          onChange={(next) => {
            setCode(next)
            setCodeError(false)
          }}
          className="mx-auto"
        />
      </main>
      <div className="w-full px-4 pb-8">
        {/* [정책 #3] 6자리 모두 입력 시 활성화, 에러 케이스 발견 시 비활성화 */}
        <ButtonCta
          disabled={code.length < CODE_LENGTH || codeError || previewLoading}
          onClick={() => void handleSubmit()}
        >
          참여하기
        </ButtonCta>
      </div>
    </MobileLayout>
  )
}
