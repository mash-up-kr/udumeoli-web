import { gqlClient } from "./client"
import { normalizeImageOrientation } from "@/shared/lib/exif-orientation"

const CREATE_IMAGE_UPLOAD_URL_MUTATION = /* GraphQL */ `
  mutation CreateImageUploadUrl($input: CreateImageUploadUrlInput!) {
    createImageUploadUrl(input: $input) {
      imageId
      uploadUrl
      encryptionHeaders {
        key
        value
      }
    }
  }
`

interface CreateImageUploadUrlResponse {
  createImageUploadUrl: {
    imageId: string
    uploadUrl: string
    // SSE-C 헤더 — PUT에 그대로 실어야 이미지별 DEK로 암호화 저장된다
    encryptionHeaders: Array<{ key: string; value: string }>
  }
}

/**
 * 로그인 상태의 이미지 업로드 — presigned URL 발급 → 원본 PUT → imageId 반환.
 *
 * 기록 사진(createTrip/recordTrip)과 프로필 사진(updateProfile)이 같은 경로를 쓴다.
 * 가입 전에는 토큰이 없어 REST 버전(`features/auth`의 requestSignupImageUpload)을 쓴다.
 */
export async function uploadImageFile(file: File): Promise<string> {
  // EXIF 회전 태그만 믿는 세로 사진은 태그를 무시하는 소비처(서버 썸네일)에서
  // 90도 돌아간다 — 업로드 전에 픽셀을 정방향으로 구워 넣는다
  const normalized = await normalizeImageOrientation(file)
  const contentType = normalized.type || "image/jpeg"

  const target = await gqlClient.request<CreateImageUploadUrlResponse>(
    CREATE_IMAGE_UPLOAD_URL_MUTATION,
    { input: { contentType } }
  )
  const { imageId, uploadUrl, encryptionHeaders } = target.createImageUploadUrl

  // presigned URL은 발급 시 서명된 헤더(content-type + SSE-C encryptionHeaders)를
  // 그대로 요구한다 — 헤더를 빼면 서명 불일치로 업로드 자체가 거부된다
  const uploaded = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      ...Object.fromEntries(encryptionHeaders.map((h) => [h.key, h.value])),
    },
    body: normalized,
  })
  if (!uploaded.ok) {
    throw new Error(`이미지 업로드 실패 (${uploaded.status})`)
  }
  return imageId
}
