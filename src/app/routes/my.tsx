import { createFileRoute } from "@tanstack/react-router"
import { MyPage } from "@/pages/my/ui/MyPage"

export const Route = createFileRoute("/my")({ component: MyPage })
