import { createFileRoute } from "@tanstack/react-router"
import { BlockedUsersPage } from "@/pages/my-page/ui/BlockedUsersPage"

export const Route = createFileRoute("/my-page/blocked-users")({
  component: BlockedUsersPage,
})
