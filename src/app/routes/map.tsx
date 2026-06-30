import { createFileRoute } from "@tanstack/react-router"
import { MapPage } from "@/pages/map/ui/MapPage"

export const Route = createFileRoute("/map")({ component: MapPage })
