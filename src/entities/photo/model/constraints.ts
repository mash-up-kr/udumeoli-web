/** BE 사진 업로드 용량 제한 — 초과하면 서버가 등록을 거부한다 */
export const MAX_PHOTO_UPLOAD_MB = 10
export const MAX_PHOTO_UPLOAD_BYTES = MAX_PHOTO_UPLOAD_MB * 1024 * 1024

/** BE ImageService ALLOWED_CONTENT_TYPES — 이 외 포맷은 업로드가 거부된다 */
export const ALLOWED_PHOTO_TYPES: ReadonlyArray<string> = [
  "image/jpeg",
  "image/png",
  "image/webp",
]
/** 파일 선택 input의 accept 값 — iOS는 이 목록에 맞춰 HEIC를 JPEG로 자동 변환해 준다 */
export const ALLOWED_PHOTO_ACCEPT = ALLOWED_PHOTO_TYPES.join(",")
/** 에러 안내용 확장자 표기 */
export const ALLOWED_PHOTO_LABEL = "jpg·png·webp"
