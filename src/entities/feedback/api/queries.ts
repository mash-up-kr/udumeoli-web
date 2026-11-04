import { useMutation } from "@tanstack/react-query"

import { submitFeedback } from "./feedback.api"

/** 서비스 피드백 전송 — 갱신할 캐시 없음. 성공·실패 처리는 호출부가 한다. */
export function useSubmitFeedback() {
  return useMutation({ mutationFn: submitFeedback })
}
