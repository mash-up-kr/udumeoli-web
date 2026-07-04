import * as React from "react"
import { useRouter } from "@tanstack/react-router"

import type { TravelPot } from "@/entities/travel-pot"
import { Button } from "@/shared/ui/button"
import { DialogTitle } from "@/shared/ui/dialog"
import { Header } from "@/shared/ui/header"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { TextField } from "@/shared/ui/text-field"
import { openBottomSheet } from "@/shared/ui/bottom-sheet"
import { showToast } from "@/shared/ui/toast"
import { usePotStore } from "@/entities/travel-pot"
import { RequireAuth } from "@/features/auth"

function JoinConfirm({
  pot,
  onYes,
  onNo,
}: {
  pot: TravelPot
  onYes: () => void
  onNo: () => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <DialogTitle className="text-h5">여행팟 정보를 확인해 주세요</DialogTitle>
      <div className="rounded-2xl bg-muted p-4">
        <p className="text-b4">
          <span className="font-semibold">{pot.name}</span> {pot.members.length}
          명 참여 중
        </p>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2">
          {pot.members.map((m) => (
            <div key={m.id} className="flex flex-col items-center gap-1">
              <span className="flex size-9 items-center justify-center rounded-full bg-neutral-300 text-b8 text-white">
                {m.nickname.slice(0, 2)}
              </span>
              <span className="text-b8 text-muted-foreground">
                {m.nickname}
              </span>
            </div>
          ))}
        </div>
      </div>
      <Button className="w-full" onClick={onYes}>
        맞아요
      </Button>
      <button
        type="button"
        className="text-center text-b6 text-muted-foreground"
        onClick={onNo}
      >
        참여하지 않고 홈으로 이동
      </button>
    </div>
  )
}

export function PotJoinPage() {
  const router = useRouter()
  const previewJoin = usePotStore((s) => s.previewJoin)
  const confirmJoin = usePotStore((s) => s.confirmJoin)
  const [code, setCode] = React.useState("")

  const handleConfirm = () => {
    const pot = previewJoin(code.trim())
    openBottomSheet(({ close }) => (
      <JoinConfirm
        pot={pot}
        onYes={() => {
          confirmJoin(pot)
          close()
          showToast({ message: `${pot.name}에 참여했어요` })
          router.navigate({ to: "/map" })
        }}
        onNo={() => {
          close()
          router.navigate({ to: "/map" })
        }}
      />
    ))
  }

  return (
    <RequireAuth>
      <MobileLayout className="flex min-h-dvh flex-col">
        <Header
          title="여행팟 참여"
          onIconClick={() => router.navigate({ to: "/map" })}
        />

        <main className="flex flex-1 flex-col px-5 pt-6">
          <TextField
            label="초대코드 입력"
            placeholder="우리 방의 초대코드를 입력해 주세요"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            inputMode="numeric"
          />
        </main>

        <div className="px-5 pb-8">
          <Button
            size="cta"
            className="w-full"
            disabled={!code.trim()}
            onClick={handleConfirm}
          >
            확인
          </Button>
        </div>
      </MobileLayout>
    </RequireAuth>
  )
}
