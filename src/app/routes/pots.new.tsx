import { createFileRoute } from "@tanstack/react-router"
import { PotCreatePage } from "@/pages/pot-create/ui/PotCreatePage"

export const Route = createFileRoute("/pots/new")({ component: PotCreatePage })
