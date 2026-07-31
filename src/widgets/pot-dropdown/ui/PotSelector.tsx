import * as React from "react"
import { useRouter } from "@tanstack/react-router"

import { getMemberPots, usePotStore } from "@/entities/travel-pot"
import { useSessionStore } from "@/entities/user"
import { openPotJoinModal } from "@/features/pot-join"
import iconCheckSrc from "@/shared/assets/icon-check.svg"
import iconChevronDownIosSrc from "@/shared/assets/icon-chevron-down-ios.svg"
import iconChevronRightSrc from "@/shared/assets/icon-chevron-right.svg"

// 시안 1893-19430: 반투명 흰색(60%) + blur 카드, 테두리 없음
const cardCls =
  "flex w-full flex-col gap-2 rounded-[24px] bg-neutral-0/60 px-2 py-4 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)] backdrop-blur-[10px]"
const rowCls =
  "flex w-full items-center gap-1 rounded-[12px] p-2 text-left transition-colors hover:bg-bg-neutral-solid active:bg-bg-neutral-solid"
const labelCls = "min-w-0 flex-1 truncate text-h8-1 text-fg-neutral-bold"

// 메인 헤더의 여행팟 선택 트리거 + 드롭다운(팟 전환 / 생성·참여 진입)
export function PotSelector() {
  const router = useRouter()
  const pots = usePotStore((s) => s.pots)
  const currentPotId = usePotStore((s) => s.currentPotId)
  const selectPot = usePotStore((s) => s.selectPot)
  const currentUserId = useSessionStore((s) => s.currentUser?.id ?? null)
  const [open, setOpen] = React.useState(false)

  // 팟이 하나도 없으면(신규 유저) 트리거에 안내 문구 노출 — 드롭다운엔 추가 카드만 남는다
  const myPots = React.useMemo(
    () => getMemberPots(pots, currentUserId),
    [pots, currentUserId]
  )
  const current = myPots.find((p) => p.id === currentPotId) ?? myPots.at(0)

  React.useEffect(() => {
    if (current && current.id !== currentPotId) selectPot(current.id)
  }, [current, currentPotId, selectPot])

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        // 시안 1893-19524: 반투명 흰색(60%) + blur 필
        className="flex h-[42px] items-center justify-center gap-2 rounded-full bg-neutral-0/60 px-4 py-2 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.05)] backdrop-blur-[2px]"
      >
        {/* 시안 글자색 #2d446c — 팔레트 부재로 최근접 토큰 blue-900(#2d4f69) 매핑 */}
        <span className="max-w-40 truncate text-h6-1 text-blue-900">
          {current?.name ?? "여행팟 추가"}
        </span>
        <img src={iconChevronDownIosSrc} alt="" className="size-5" />
      </button>

      {open ? (
        <>
          {/* 배경 클릭 시 닫힘 (시안 변경으로 dim 없음) */}
          <button
            type="button"
            aria-label="닫기"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />

          {/* 트리거 아래 8px에 카드 2개 (참여 중 여행팟 / 여행팟 추가) — 시안 1893-19429
              트리거가 헤더 우측에 놓이므로 right-0 정렬 — left 정렬이면 화면 밖으로 넘친다 */}
          <div className="absolute top-[calc(100%+8px)] right-0 z-50 flex w-[220px] flex-col gap-1">
            {myPots.length > 0 ? (
              <div className={cardCls}>
                <p className="w-full px-2 text-h9 text-fg-neutral-subtle">
                  여행팟
                </p>
                <div className="flex w-full flex-col">
                  {myPots.map((pot) => (
                    <button
                      key={pot.id}
                      type="button"
                      onClick={() => {
                        selectPot(pot.id)
                        setOpen(false)
                      }}
                      className={rowCls}
                    >
                      {pot.id === current?.id ? (
                        <img
                          src={iconCheckSrc}
                          alt="현재 여행팟"
                          className="size-5 shrink-0"
                        />
                      ) : null}
                      <span className={labelCls}>{pot.name}</span>
                      <img
                        src={iconChevronRightSrc}
                        alt=""
                        className="size-5 shrink-0"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className={cardCls}>
              <p className="w-full px-2 text-h9 text-fg-neutral-subtle">
                여행팟 추가
              </p>
              <div className="flex w-full flex-col">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    router.navigate({ to: "/pot-create" })
                  }}
                  className={rowCls}
                >
                  <span className={labelCls}>새 팟 만들기</span>
                  <img
                    src={iconChevronRightSrc}
                    alt=""
                    className="size-5 shrink-0"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    openPotJoinModal()
                  }}
                  className={rowCls}
                >
                  <span className={labelCls}>초대코드로 참여하기</span>
                  <img
                    src={iconChevronRightSrc}
                    alt=""
                    className="size-5 shrink-0"
                  />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
