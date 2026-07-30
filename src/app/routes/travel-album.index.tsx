import { createFileRoute } from "@tanstack/react-router"
import { TravelAlbumPage } from "@/pages/travel-album/ui/TravelAlbumPage"

export const Route = createFileRoute("/travel-album/")({
  component: TravelAlbumPage,
})
