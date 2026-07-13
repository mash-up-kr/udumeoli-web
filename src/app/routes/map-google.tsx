import { createFileRoute } from "@tanstack/react-router"
import { MapGooglePage } from "@/pages/map-google/ui/MapGooglePage"

export const Route = createFileRoute("/map-google")({
  component: MapGooglePage,
})
