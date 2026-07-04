import * as React from "react"
import { useRouter } from "@tanstack/react-router"
import { ArrowRight, Check, ChevronDown, Plus } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { showToast } from "@/shared/ui/toast"
import { usePotStore } from "@/entities/travel-pot"

// 메인 헤더의 여행팟 선택 트리거 + 드롭다운(팟 전환 / 생성·참여 진입)
export function PotSelector() {
  const pots = usePotStore((s) => s.pots)
  const currentPotId = usePotStore((s) => s.currentPotId)
  const selectPot = usePotStore((s) => s.selectPot)
  const router = useRouter()
  const [open, setOpen] = React.useState(false)

  const current = pots.find((p) => p.id === currentPotId) ?? pots[0]
  const notReady = () =>
    showToast({ message: "준비 중인 기능이에요", type: "info" })

  return (
    <div className="relative">
      <Button
        variant="surface"
        size="sm"
        radius="full"
        shadow="sm"
        className="h-[42px] gap-2.5 bg-white/75 px-[15px] backdrop-blur-[2px]"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {current.name}
        <ChevronDown className="size-4" />
      </Button>

      {open ? (
        <>
          {/* 배경 dim (wireframe-alpha-500), 클릭 시 닫힘 */}
          <button
            type="button"
            aria-label="닫기"
            className="fixed inset-0 z-40 cursor-default bg-bg-dim-solid"
            onClick={() => setOpen(false)}
          />

          {/* 시안대로 박스 2개 분리 (참여 중 / 새로 만들기·참여) */}
          <div className="absolute top-full left-0 z-50 mt-2 flex flex-col gap-3">
            {/* 위: 참여 중인 여행팟 */}
            <div className="flex w-[260px] flex-col items-start gap-3 rounded-[20px] bg-background p-3">
              <p className="w-full text-h8-1 text-neutral-800">
                참여 중인 여행팟
              </p>
              <div className="flex w-full flex-col gap-1">
                {pots.map((pot, i) => {
                  const active = pot.id === currentPotId
                  return (
                    <React.Fragment key={pot.id}>
                      {i > 0 ? (
                        <div className="h-px w-full bg-neutral-200" />
                      ) : null}
                      {active ? (
                        <div className="flex w-full flex-col gap-2 rounded-[20px] p-[10px]">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => {
                                selectPot(pot.id)
                                setOpen(false)
                              }}
                              className="text-left text-h4 text-neutral-800"
                            >
                              {pot.name}
                            </button>
                            <Check className="size-6 shrink-0 text-neutral-800" />
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={notReady}
                              className="rounded-md bg-secondary px-2 py-1 text-b8 text-neutral-600"
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={notReady}
                              className="rounded-md bg-secondary px-2 py-1 text-b8 text-neutral-600"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            selectPot(pot.id)
                            setOpen(false)
                          }}
                          className="flex w-full items-center rounded-[20px] p-[10px] text-left text-h4 text-neutral-800 hover:bg-muted"
                        >
                          {pot.name}
                        </button>
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </div>

            {/* 아래: 새로 만들기 / 참여하기 */}
            <div className="flex w-[260px] flex-col items-start gap-3 rounded-[20px] bg-background p-3">
              <p className="w-full text-h8-1 text-neutral-800">
                새로 만들기 / 참여하기
              </p>
              <div className="flex w-full flex-col gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    router.navigate({ to: "/pots/new" })
                  }}
                  className="flex w-full items-center gap-2 rounded-[20px] p-[10px] text-h4 text-neutral-800 hover:bg-muted"
                >
                  <Plus className="size-6 shrink-0" /> 여행팟 생성
                </button>
                <div className="h-px w-full bg-neutral-200" />
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    router.navigate({ to: "/pots/join" })
                  }}
                  className="flex w-full items-center gap-2 rounded-[20px] p-[10px] text-h4 text-neutral-800 hover:bg-muted"
                >
                  <ArrowRight className="size-6 shrink-0" /> 여행팟 참여
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
