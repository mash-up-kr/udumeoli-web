import { createFileRoute } from "@tanstack/react-router"

import { MyProfileEditPage } from "@/pages/my-page/ui/MyProfileEditPage"

export const Route = createFileRoute("/my-page/profile-edit")({
  component: MyProfileEditPage,
})
