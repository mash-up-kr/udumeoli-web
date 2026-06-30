import { createFileRoute } from "@tanstack/react-router"
import { ProfilePage } from "@/pages/profile/ui/ProfilePage"

export const Route = createFileRoute("/my/profile")({ component: ProfilePage })
