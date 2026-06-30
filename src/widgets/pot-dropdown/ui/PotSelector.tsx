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
  const notReady = () => showToast({ message: "준비 중인 기능이에요", type: "info" })

  return (
    <div className="relative">
      <Button
        variant="surface"
        size="sm"
        radius="full"
        shadow="sm"
        className="h-[42px] gap-2.5 bg-white/60 px-[15px] backdrop-blur-[2px]"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {current.name}
        <ChevronDown className="size-4" />
      </Button>

      {open ? (
        <>
          {/* 배경 dim + blur, 클릭 시 닫힘 */}
          <button
            type="button"
            aria-label="닫기"
            className="fixed inset-0 z-40 cursor-default bg-black/20 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />

          <div className="absolute top-full left-0 z-50 mt-2 w-64 rounded-2xl bg-background p-2 shadow-[0_4px_20px_0_rgba(0,0,0,0.12)]">
            <p className="px-2 py-1 text-b7 text-muted-foreground">참여 중인 여행팟</p>
            {pots.map((pot) => {
              const active = pot.id === currentPotId
              return (
                <div
                  key={pot.id}
                  className="flex items-center justify-between rounded-lg px-2 py-2.5 hover:bg-muted"
                >
                  <button
                    type="button"
                    onClick={() => {
                      selectPot(pot.id)
                      setOpen(false)
                    }}
                    className="flex flex-1 items-center gap-1.5 text-left text-b4"
                  >
                    {pot.name}
                    {active ? <Check className="size-4" /> : null}
                  </button>
                  {active ? (
                    <span className="flex gap-2 text-b8 text-muted-foreground">
                      <button type="button" onClick={notReady}>
                        수정
                      </button>
                      <button type="button" onClick={notReady}>
                        삭제
                      </button>
                    </span>
                  ) : null}
                </div>
              )
            })}

            <div className="my-1.5 border-t" />

            <p className="px-2 py-1 text-b7 text-muted-foreground">새로 만들기 / 참여하기</p>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                router.navigate({ to: "/pots/new" })
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-b4 hover:bg-muted"
            >
              <Plus className="size-4" /> 여행팟 생성
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                router.navigate({ to: "/pots/join" })
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-b4 hover:bg-muted"
            >
              <ArrowRight className="size-4" /> 여행팟 참여
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}
