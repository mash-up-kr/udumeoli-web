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
import { RequireAuth } from "@/features/auth"
import {
  TicketCard,
  TicketPrintStage,
  fetchPartyPreview,
  takePendingInviteCode,
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

// 토스트 위치 규칙(2차 UT): 하단 고정 요소 상단에서 16px 위.
// 코드 입력 화면 CTA(참여하기) 위 — CTA bottom 32(pb-8) + 높이 56 + 16
const CODE_TOAST_POSITION = "bottom-[104px]"

// 지도 진입 후 뜨는 토스트 — 하단 내비 위 16px (내비 bottom 33 + 바 높이 77 + 16)
const MAP_TOAST_POSITION = "bottom-[126px]"

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
    <MobileLayout className="relative flex min-h-[var(--app-vh)] animate-in flex-col bg-bg-neutral-solid duration-300 fade-in-0">
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
      </main>
      <TicketPrintStage>
        <TicketCard
          name={preview.name}
          // preview 응답에 리더 필드가 없다 — 서버가 owner를 먼저 내려주는 순서에 의존해 첫 멤버 표기
          leaderName={preview.members.at(0)?.nickname ?? "-"}
          // 내가 앉을 자리 = 현재 인원 + 1
          seatLabel={String(preview.memberCount + 1).padStart(2, "0")}
          // 기울임은 안착 애니메이션 래퍼(TicketPrintStage)가 담당 — 카드는 정방향으로 인쇄
          className="pointer-events-auto rotate-none"
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
      </TicketPrintStage>
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
function PotJoinPageContent({ initialCode }: { initialCode?: string }) {
  const router = useRouter()
  const previewJoin = usePotStore((s) => s.previewJoin)
  const confirmJoin = usePotStore((s) => s.confirmJoin)
  const selectPot = usePotStore((s) => s.selectPot)
  const joinPartyMutation = useJoinParty()
  const currentUser = useSessionStore((s) => s.currentUser)
  const [code, setCode] = React.useState(initialCode ?? "")
  // [정책 #3] 검증 실패 시 에러 테두리 + CTA 비활성 — 다시 입력하면 해제
  const [codeError, setCodeError] = React.useState(false)
  const [previewLoading, setPreviewLoading] = React.useState(false)
  // 참여 확인 스텝 데이터 — 있으면 확인 화면, 없으면 코드 입력 화면
  const [preview, setPreview] = React.useState<JoinPreview | null>(null)

  // 초대링크로 보관된 코드 소비 — 여기(인증 통과 후)까지 왔으면 역할이 끝났으니
  // 지운다. search로 못 받은 경로(로그인 콜백 복귀 등)에선 프리필로도 쓴다.
  // 마운트 효과로 채워야 SSR 첫 렌더(빈 셀)와 hydration이 어긋나지 않는다
  React.useEffect(() => {
    const pending = takePendingInviteCode()
    if (!pending || initialCode) return
    // NumberCode alphanumeric과 같은 규칙 [정책 #2: 영문 소문자+숫자 6자리]
    const sanitized = pending
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, CODE_LENGTH)
    if (sanitized) setCode(sanitized)
  }, [initialCode])

  // 뒤로가기 — 실제 진입 지점(팟 시작 온보딩/지도 드롭다운)으로 복귀 [정책 #1].
  // 초대링크로 곧장 진입하면(replace 체인) 되돌아갈 히스토리가 없어 back()이
  // 무동작 — 랜딩으로 보낸다. 랜딩이 미로그인이면 로그인 화면을, 로그인 세션이
  // 있으면 자동으로 지도까지 보내준다
  const goBack = () => {
    if (router.history.canGoBack()) {
      router.history.back()
    } else {
      router.navigate({ to: "/", replace: true })
    }
  }
  // 참여 확정 시 팟의 여행 지도로 이동 [정책 #9] — replace로 참여 플로우를 히스토리에서 걷어낸다
  const goToMap = () => router.navigate({ to: "/map-google", replace: true })

  const showJoinedToast = (pot: TravelPot, memberCount: number) => {
    // [정책 #10] "OOO에 참여했어요 (n/6)" — 지도 진입 화면 위 3초 노출
    showToast({
      message: `${pot.name}에 참여했어요 (${memberCount}/${POT_CAPACITY})`,
      icon: "check",
      className: MAP_TOAST_POSITION,
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

  // 초대링크로 들어온 팟에 이미 참여중 — 에러 대신 그 팟을 현재 팟으로 선택하고
  // 지도로 통과시킨다 (수동 입력은 기존 에러 토스트 유지)
  const enterAlreadyJoinedPot = () => {
    const myPot = usePotStore.getState().pots.find((p) => p.inviteCode === code)
    if (myPot) selectPot(myPot.id)
    goToMap()
    // 어느 팟인지는 지도 우상단 드롭다운이 보여준다 — 문구는 핵심만 짧게
    showToast({
      message: "이미 참여중인 여행팟이에요",
      icon: "alert-neutral",
      className: MAP_TOAST_POSITION,
    })
  }

  // [정책 #3] 참여하기 — 코드 유효성 검사 후 확인 스텝으로 전환.
  // fromLink: 초대링크 자동 진입 여부 — 이미 참여중 에러의 분기에만 쓴다
  const handleSubmit = async ({ fromLink = false } = {}) => {
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
      if (fromLink && getGraphQLErrorCode(error) === "ALREADY_JOINED_PARTY") {
        enterAlreadyJoinedPot()
        return
      }
      showJoinError(error)
    } finally {
      setPreviewLoading(false)
    }
  }

  // 초대 링크(?inviteCode=) 진입이면 코드 입력 없이 곧장 확인 스텝(팟 티켓)으로.
  // 실패(만료·정원 초과 등) 시엔 코드가 채워진 입력 화면 + 에러 토스트로 남는다
  const autoPreviewedRef = React.useRef(false)
  React.useEffect(() => {
    if (!initialCode || autoPreviewedRef.current) return
    autoPreviewedRef.current = true
    void handleSubmit({ fromLink: true })
  })

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
    <MobileLayout className="flex min-h-[var(--app-vh)] animate-in flex-col bg-bg-neutral-subtle duration-300 fade-in-0">
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

export function PotJoinPage({ initialCode }: { initialCode?: string }) {
  return (
    // 참여(preview·join) 요청은 인증 필수 — 초대링크로 온 미로그인 유저(카톡 인앱
    // 브라우저 등)가 여기서 인증 에러 토스트를 받는 대신 로그인부터 타게 한다.
    // 보관된 초대코드는 로그인 콜백이 다시 이 화면으로 데려온 뒤 프리필된다
    <RequireAuth>
      <PotJoinPageContent initialCode={initialCode} />
    </RequireAuth>
  )
}
