import { Input } from "./input"
import { DialogTitle } from "./dialog"
import { ButtonCta } from "./button-cta"
import { openModal } from "./modal"
import { showToast } from "./toast"

/** 복사가 거절되거나 미지원이면 수동으로 복사할 수 있게 원문을 제공한다. */
export async function copyText(
  text: string,
  successMessage: string,
  toastClassName?: string
): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    openModal(
      ({ close }) => (
        <>
          <DialogTitle>직접 복사해 주세요</DialogTitle>
          <p className="text-b6 text-fg-neutral-subtle">
            자동으로 복사하지 못했어요. 아래 내용을 길게 눌러 복사해 주세요.
          </p>
          <Input
            aria-label="복사할 내용"
            readOnly
            value={text}
            onFocus={(event) => event.currentTarget.select()}
          />
          <ButtonCta onClick={close}>확인</ButtonCta>
        </>
      ),
      { showCloseButton: false }
    )
    return
  }
  showToast({
    message: successMessage,
    icon: "check",
    className: toastClassName,
  })
}
