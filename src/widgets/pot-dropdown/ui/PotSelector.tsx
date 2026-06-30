import { useRouter } from "@tanstack/react-router"
import { ArrowRight, Check, ChevronDown, Plus } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { openBottomSheet } from "@/shared/ui/bottom-sheet"
import { DialogTitle } from "@/shared/ui/dialog"
import { usePotStore } from "@/entities/travel-pot"

// 메인 헤더의 여행팟 선택 트리거 + 목록 바텀시트(생성/참여 진입)
export function PotSelector() {
  const pots = usePotStore((s) => s.pots)
  const currentPotId = usePotStore((s) => s.currentPotId)
  const selectPot = usePotStore((s) => s.selectPot)
  const router = useRouter()

  const current = pots.find((p) => p.id === currentPotId) ?? pots[0]

  const open = () => {
    openBottomSheet(({ close }) => (
      <div className="flex flex-col">
        <DialogTitle className="px-2 pb-1 text-b6 text-muted-foreground">참여 중인 여행팟</DialogTitle>
        {pots.map((pot) => (
          <button
            key={pot.id}
            type="button"
            onClick={() => {
              selectPot(pot.id)
              close()
            }}
            className="flex items-center justify-between rounded-lg px-2 py-3 text-b4 hover:bg-muted"
          >
            {pot.name}
            {pot.id === currentPotId ? <Check className="size-4" /> : null}
          </button>
        ))}
        <div className="mt-2 flex flex-col border-t pt-2">
          <button
            type="button"
            onClick={() => {
              close()
              router.navigate({ to: "/pots/new" })
            }}
            className="flex items-center gap-2 rounded-lg px-2 py-3 text-b4 hover:bg-muted"
          >
            <Plus className="size-4" /> 여행팟 생성
          </button>
          <button
            type="button"
            onClick={() => {
              close()
              router.navigate({ to: "/pots/join" })
            }}
            className="flex items-center gap-2 rounded-lg px-2 py-3 text-b4 hover:bg-muted"
          >
            <ArrowRight className="size-4" /> 여행팟 참여
          </button>
        </div>
      </div>
    ))
  }

  return (
    <Button variant="surface" size="sm" radius="full" shadow="sm" className="gap-1" onClick={open}>
      {current.name}
      <ChevronDown className="size-4" />
    </Button>
  )
}
