import { APP_VERSION } from "@/shared/config/app"

/** 사용자 정보·본문·사진 URL을 넣지 않고 콘텐츠 식별자와 작성 양식만 전달한다. */
export function reportMailto(target: {
  tripId: string
  imageId?: string
}): string {
  const body = [
    "여행 기록 신고",
    `여행 ID: ${target.tripId}`,
    `사진 ID: ${target.imageId ?? "미확인 (대상 사진을 첨부해 주세요)"}`,
    `앱 버전: ${APP_VERSION}`,
    "",
    "신고 사유: (욕설 / 광고 / 음란 / 개인정보 / 기타 중 작성)",
    "상세 내용: ",
    "",
    "필요하면 신고할 사진의 화면 캡처를 첨부해 주세요.",
    "이 메일을 직접 전송해야 신고할 수 있어요. 앱에서는 전송·접수·처리 여부를 확인할 수 없어요.",
    "신고만으로 기록이 숨겨지거나 작성자가 차단되지는 않아요. 미처리 시 운영팀에 다시 문의해 주세요.",
  ].join("\n")
  return `mailto:pinnned.dev@gmail.com?subject=${encodeURIComponent("여행 기록 신고")}&body=${encodeURIComponent(body)}`
}
