import { createFileRoute } from "@tanstack/react-router"
import { PotStartPage } from "@/pages/pot-start/ui/PotStartPage"

export const Route = createFileRoute("/pot-start")({
  component: PotStartPage,
})
