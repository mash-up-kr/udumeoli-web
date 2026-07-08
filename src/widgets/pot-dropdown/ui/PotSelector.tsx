import * as React from "react"

import { usePotStore } from "@/entities/travel-pot"
import { openPotCreateModal } from "@/features/pot-create"
import { openPotJoinModal } from "@/features/pot-join"
import iconCheckSrc from "@/shared/assets/icon-check.svg"
import iconChevronDownSrc from "@/shared/assets/icon-chevron-down.svg"
import iconChevronRightSrc from "@/shared/assets/icon-chevron-right.svg"

const cardCls =
  "flex w-full flex-col gap-1 rounded-[24px] border border-stroke-neutral-inverse bg-bg-neutral-subtle px-2 py-4 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]"
const rowCls =
  "flex w-full items-center gap-1 rounded-[12px] p-2 text-left transition-colors hover:bg-bg-neutral-solid active:bg-bg-neutral-solid"
const labelCls = "min-w-0 flex-1 text-h8-1 text-fg-neutral-bold"

// 메인 헤더의 여행팟 선택 트리거 + 드롭다운(팟 전환 / 생성·참여 진입)
export function PotSelector() {
  const pots = usePotStore((s) => s.pots)
  const currentPotId = usePotStore((s) => s.currentPotId)
  const selectPot = usePotStore((s) => s.selectPot)
  const [open, setOpen] = React.useState(false)

  const current = pots.find((p) => p.id === currentPotId) ?? pots[0]

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center gap-1 rounded-full bg-bg-neutral-subtle py-2 pr-3 pl-4 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]"
      >
        <span className="max-w-40 truncate text-b5 text-fg-neutral-bold">
          {current.name}
        </span>
        <img src={iconChevronDownSrc} alt="" className="size-6" />
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

          {/* 트리거 위치를 덮는 카드 2개 (참여 중 여행팟 / 여행팟 추가) */}
          <div className="absolute top-0 left-0 z-50 flex w-[220px] flex-col gap-1">
            <div className={cardCls}>
              <p className="w-full px-2 text-h8-1 text-fg-neutral-subtle">
                여행팟
              </p>
              <div className="flex w-full flex-col">
                {pots.map((pot) => (
                  <button
                    key={pot.id}
                    type="button"
                    onClick={() => {
                      selectPot(pot.id)
                      setOpen(false)
                    }}
                    className={rowCls}
                  >
                    {pot.id === currentPotId ? (
                      <img
                        src={iconCheckSrc}
                        alt="현재 여행팟"
                        className="size-6 shrink-0"
                      />
                    ) : null}
                    <span className={`${labelCls} line-clamp-2`}>
                      {pot.name}
                    </span>
                    <img
                      src={iconChevronRightSrc}
                      alt=""
                      className="size-6 shrink-0"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className={cardCls}>
              <p className="w-full px-2 text-h8-1 text-fg-neutral-subtle">
                여행팟 추가
              </p>
              <div className="flex w-full flex-col">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    openPotCreateModal()
                  }}
                  className={rowCls}
                >
                  <span className={labelCls}>여행팟 만들기</span>
                  <img
                    src={iconChevronRightSrc}
                    alt=""
                    className="size-6 shrink-0"
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
                  <span className={labelCls}>여행팟 참여</span>
                  <img
                    src={iconChevronRightSrc}
                    alt=""
                    className="size-6 shrink-0"
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
