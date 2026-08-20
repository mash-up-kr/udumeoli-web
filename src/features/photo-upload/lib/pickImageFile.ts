import {
  ALLOWED_PHOTO_ACCEPT,
  ALLOWED_PHOTO_LABEL,
  ALLOWED_PHOTO_TYPES,
  MAX_PHOTO_UPLOAD_BYTES,
  MAX_PHOTO_UPLOAD_MB,
} from "@/entities/photo"
import { showToast } from "@/shared/ui/toast"

// 파일 선택 다이얼로그를 열어 선택한 이미지의 object URL(미리보기)과 원본 File을 콜백
export function pickImageFile(onPick: (url: string, file: File) => void) {
  const input = document.createElement("input")
  input.type = "file"
  input.accept = ALLOWED_PHOTO_ACCEPT
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file) return
    // BE 허용 포맷·용량 제한 — 초과/미지원 파일은 요청 전에 걸러 안내.
    // type이 빈 파일은 업로드 시 image/jpeg 폴백(photo.api)이 있어 통과시킨다
    if (file.type && !ALLOWED_PHOTO_TYPES.includes(file.type)) {
      showToast({
        message: `${ALLOWED_PHOTO_LABEL} 형식 사진만 등록할 수 있어요.`,
        icon: "alert",
      })
      return
    }
    if (file.size > MAX_PHOTO_UPLOAD_BYTES) {
      showToast({
        message: `사진은 최대 ${MAX_PHOTO_UPLOAD_MB}MB까지 등록할 수 있어요.`,
        icon: "alert",
      })
      return
    }
    onPick(URL.createObjectURL(file), file)
  }
  input.click()
}
