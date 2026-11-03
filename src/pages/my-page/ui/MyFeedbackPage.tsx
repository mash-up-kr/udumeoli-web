import * as React from "react"
import { useRouter } from "@tanstack/react-router"

import {
  FEEDBACK_CONTENT_MAX,
  canSubmit,
  ratingLabel,
} from "../lib/feedback-form"
import { Header } from "@/shared/ui/header"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { ButtonCta } from "@/shared/ui/button-cta"
import { DialogTitle } from "@/shared/ui/dialog"
import { openModal } from "@/shared/ui/modal"
import { showToast } from "@/shared/ui/toast"
import { cn } from "@/shared/lib/utils"
import { useSubmitFeedback } from "@/entities/feedback"
import { RequireAuth } from "@/features/auth"
import iconAlertDangerSrc from "@/shared/assets/icon-alert-danger.svg"
import iconStarEmptySrc from "@/shared/assets/icon-star-empty.svg"
import iconStarFilledSrc from "@/shared/assets/icon-star-filled.svg"

const STARS = [1, 2, 3, 4, 5]

// MyPagePage.popupModalClassName과 동일 — 팝업 시안(343 카드 · radius 32 · p-16)
const popupModalClassName =
  "w-[343px] max-w-[calc(100%-2rem)] gap-4 rounded-[32px] p-4 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]"

const sectionTitleCls = "text-h8-1 text-neutral-500"

function LeaveConfirmContent({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <>
      {/* Figma 4200-19654 — 그래픽 슬롯(60, 아이콘 top 12) · gap 16 · 텍스트 컨테이너 py-8 gap-10 */}
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="mt-3 flex size-12 items-center justify-center rounded-full bg-bg-neutral-subtle">
          <img src={iconAlertDangerSrc} alt="" className="size-9" />
        </span>
        <div className="flex flex-col gap-2.5 py-2">
          <DialogTitle className="text-h5-1 text-fg-neutral-bold">
            작성을 그만두시겠어요?
          </DialogTitle>
          <p className="text-b6 text-fg-neutral-subtle">
            지금 나가면 입력한 별점과 내용이 저장되지 않아요.
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <ButtonCta
          variant="secondary"
          className="w-25 shrink-0"
          onClick={onCancel}
        >
          계속 작성
        </ButtonCta>
        <ButtonCta variant="danger" className="flex-1" onClick={onConfirm}>
          나가기
        </ButtonCta>
      </div>
    </>
  )
}

function MyFeedbackContent() {
  const router = useRouter()
  const submitFeedbackMutation = useSubmitFeedback()
  const [rating, setRating] = React.useState(0)
  const [content, setContent] = React.useState("")
  const contentId = React.useId()

  const sending = submitFeedbackMutation.isPending
  const dirty = rating > 0 || content.length > 0

  const goMyPage = () => router.navigate({ to: "/my-page", replace: true })

  const handleBack = () => {
    if (!dirty) {
      void goMyPage()
      return
    }
    openModal(
      ({ close }) => (
        <LeaveConfirmContent
          onCancel={close}
          onConfirm={() => {
            close()
            void goMyPage()
          }}
        />
      ),
      { className: popupModalClassName, showCloseButton: false }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending || !canSubmit(rating, content)) return
    try {
      await submitFeedbackMutation.mutateAsync({
        rating,
        content: content.trim(),
      })
    } catch {
      // 입력은 유지한 채 재시도 유도
      showToast({
        message: "전송에 실패했어요. 다시 시도해 주세요.",
        icon: "alert",
        // CTA(bottom 42 + 높이 56) 위 16px (Figma 4200-19512)
        className: "bottom-[114px]",
      })
      return
    }
    await goMyPage()
    // 파란 ✓ — 완료 (Figma 4200-19156)
    showToast({ message: "소중한 의견 감사드립니다!", icon: "check" })
  }

  return (
    <MobileLayout className="flex min-h-[var(--app-vh)] flex-col bg-bg-neutral-subtle">
      <Header title="서비스 피드백" onIconClick={handleBack} />

      <form className="flex flex-1 flex-col" onSubmit={handleSubmit} noValidate>
        {/* 상단 고정 블록(인트로·별점) / 가변 영역(내용 입력) / 하단 고정(CTA) — Figma 4203-6333 */}
        <main className="flex flex-1 flex-col gap-8 px-4 pt-3">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-h3 text-fg-neutral-bold">
              Pinnned, 어떠셨나요?
            </h2>
            <p className="text-b6 whitespace-pre-line text-fg-neutral-subtle">
              {
                "보내주신 의견은 팀원들이 모두 읽고\n더 좋은 서비스를 만드는 데 사용할 예정입니다."
              }
            </p>
          </div>

          <section className="flex flex-col gap-2">
            <p id={`${contentId}-rating`} className={sectionTitleCls}>
              만족도
            </p>
            <div
              role="group"
              aria-labelledby={`${contentId}-rating`}
              className="flex justify-center gap-2 pt-2 pb-1"
            >
              {STARS.map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`${star}점`}
                  aria-pressed={rating === star}
                  className="size-10 shrink-0"
                  onClick={() => setRating(star)}
                >
                  <img
                    src={star <= rating ? iconStarFilledSrc : iconStarEmptySrc}
                    alt=""
                    className="size-10"
                  />
                </button>
              ))}
            </div>
            <p
              aria-live="polite"
              className={cn(
                "px-1 text-center text-b6",
                rating > 0 ? "text-fg-neutral-solid" : "text-fg-neutral-subtle"
              )}
            >
              {ratingLabel(rating)}
            </p>
          </section>

          <section className="flex flex-1 flex-col gap-2">
            <label htmlFor={contentId} className={sectionTitleCls}>
              자세한 내용
            </label>
            {/* 기준 뷰포트에서 240px(시안), 낮은 화면에서는 최소 160px까지 줄어 CTA가 잘리지 않는다 */}
            <div className="flex max-h-60 min-h-40 flex-1 flex-col rounded-xl border border-stroke-neutral-weak bg-bg-neutral-weak px-4 pt-3.5 pb-3 transition-colors focus-within:border-stroke-neutral-bold">
              <textarea
                id={contentId}
                value={content}
                maxLength={FEEDBACK_CONTENT_MAX}
                placeholder="좋았던 점, 불편했던 점, 바라는 기능 등을 자유롭게 적어주세요."
                className="min-h-0 w-full flex-1 resize-none bg-transparent text-b4 text-fg-neutral-bold outline-none placeholder:text-fg-neutral-subtle"
                onChange={(e) => setContent(e.target.value)}
              />
              <span className="pt-2 text-right text-b8 text-fg-neutral-subtle">
                {content.length.toLocaleString()} /{" "}
                {FEEDBACK_CONTENT_MAX.toLocaleString()}
              </span>
            </div>
          </section>
        </main>

        {/* CTA pt-12 · pb-8 + 홈 인디케이터 34 (Figma 4203-6486) */}
        <div className="w-full px-4 pt-3 pb-[calc(max(env(safe-area-inset-bottom),34px)+8px)]">
          <ButtonCta
            type="submit"
            disabled={!canSubmit(rating, content) || sending}
          >
            피드백 보내기
          </ButtonCta>
        </div>
      </form>
    </MobileLayout>
  )
}

export function MyFeedbackPage() {
  return (
    <RequireAuth>
      <MyFeedbackContent />
    </RequireAuth>
  )
}
