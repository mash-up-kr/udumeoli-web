import { Button } from "./button"

/** 조회 실패와 정상 빈 상태에서 다음 행동을 제공한다. */
export function QueryFeedback({
  message,
  actionLabel = "다시 시도",
  onAction,
  pending = false,
}: {
  message: string
  actionLabel?: string
  onAction: () => void
  pending?: boolean
}) {
  return (
    <div
      role="status"
      className="flex w-full flex-col items-center gap-4 px-4 py-10 text-center"
    >
      <p className="text-b6 text-fg-neutral-subtle">{message}</p>
      <Button
        variant="secondary"
        radius="full"
        className="min-h-11 px-5"
        disabled={pending}
        aria-busy={pending}
        onClick={onAction}
      >
        {pending ? "불러오는 중…" : actionLabel}
      </Button>
    </div>
  )
}
