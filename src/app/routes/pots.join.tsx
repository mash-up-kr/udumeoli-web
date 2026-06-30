import { createFileRoute } from "@tanstack/react-router"
import { PotJoinPage } from "@/pages/pot-join/ui/PotJoinPage"

export const Route = createFileRoute("/pots/join")({ component: PotJoinPage })
