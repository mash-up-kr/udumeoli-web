import { createFileRoute } from "@tanstack/react-router"

import { MyFeedbackPage } from "@/pages/my-page/ui/MyFeedbackPage"

export const Route = createFileRoute("/my-page/feedback")({
  component: MyFeedbackPage,
})
