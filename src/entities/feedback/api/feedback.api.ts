import { USE_MOCK, gqlClient, mockResponse } from "@/shared/api/client"
import { APP_VERSION } from "@/shared/config/app"

// BE 미구현 — 스키마 확정 시 수정. 아래는 BE에 전달한 제안 계약:
//   mutation SubmitFeedback($input: SubmitFeedbackInput!) { submitFeedback(input: $input) }
//   input SubmitFeedbackInput { rating: Int!  content: String!  appVersion: String!  deviceInfo: String! }
// 유저는 Bearer 토큰으로 BE가 식별하고 전송 시각은 BE가 기록한다 — input에 넣지 않는다.
const SUBMIT_FEEDBACK_MUTATION = /* GraphQL */ `
  mutation SubmitFeedback($input: SubmitFeedbackInput!) {
    submitFeedback(input: $input)
  }
`

export interface SubmitFeedbackInput {
  /** 만족도 1~5 */
  rating: number
  /** 공백 제외 1자 이상, 최대 5,000자 */
  content: string
  appVersion: string
  deviceInfo: string
}

export type FeedbackDraft = Pick<SubmitFeedbackInput, "rating" | "content">

export async function submitFeedback(draft: FeedbackDraft): Promise<void> {
  if (USE_MOCK) {
    await mockResponse(null)
    return
  }
  const input: SubmitFeedbackInput = {
    ...draft,
    appVersion: APP_VERSION,
    deviceInfo: navigator.userAgent,
  }
  await gqlClient.request(SUBMIT_FEEDBACK_MUTATION, { input })
}
