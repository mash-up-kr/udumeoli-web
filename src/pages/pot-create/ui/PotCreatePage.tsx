import * as React from "react"
import { useRouter } from "@tanstack/react-router"
import { X } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Header } from "@/shared/ui/header"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { TextField } from "@/shared/ui/text-field"
import { showToast } from "@/shared/ui/toast"
import { usePotStore } from "@/entities/travel-pot"
import { RequireAuth } from "@/features/auth"

export function PotCreatePage() {
  const router = useRouter()
  const createPot = usePotStore((s) => s.createPot)
  const [name, setName] = React.useState("")
  const [created, setCreated] = React.useState<{ name: string; code: string } | null>(null)

  const handleCreate = () => {
    const pot = createPot(name.trim())
    setCreated({ name: pot.name, code: pot.inviteCode })
  }

  return (
    <RequireAuth>
      <MobileLayout className="flex min-h-dvh flex-col">
        <Header>
          {created ? (
            <button
              type="button"
              aria-label="닫기"
              onClick={() => router.navigate({ to: "/map" })}
              className="flex shrink-0 items-center justify-center"
            >
              <X className="size-6" />
            </button>
          ) : (
            <Header.Back onClick={() => router.navigate({ to: "/map" })} />
          )}
          <Header.Title>여행팟 생성</Header.Title>
        </Header>

        {created ? (
          <main className="flex flex-1 flex-col gap-8 px-5 pt-6">
            <p className="text-h5 leading-snug font-semibold">
              {created.name}
              <br />
              여행팟 코드가 발급되었어요
            </p>

            <div className="grid w-full grid-cols-6 gap-2">
              {created.code.split("").map((digit, i) => (
                <span
                  key={i}
                  className="flex h-13 items-center justify-center rounded-[10px] bg-neutral-150 text-h4"
                >
                  {digit}
                </span>
              ))}
            </div>

            <div className="flex flex-col items-center gap-4 pt-2">
              <Button
                radius="full"
                className="bg-neutral-400 px-14 text-white hover:bg-neutral-400/90"
                onClick={() => showToast({ message: "초대코드를 복사했어요", type: "success" })}
              >
                공유하기
              </Button>
              <button
                type="button"
                className="text-b6 text-muted-foreground"
                onClick={() => router.navigate({ to: "/map" })}
              >
                홈으로 이동
              </button>
            </div>
          </main>
        ) : (
          <>
            <main className="flex flex-1 flex-col px-5 pt-6">
              <TextField
                label="여행팟 이름"
                placeholder="우리 방의 이름을 작성해 주세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
              />
            </main>
            <div className="px-5 pb-8">
              <Button size="cta" className="w-full" disabled={!name.trim()} onClick={handleCreate}>
                초대하기
              </Button>
            </div>
          </>
        )}
      </MobileLayout>
    </RequireAuth>
  )
}
