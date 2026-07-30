import { createFileRoute } from "@tanstack/react-router"
import { TravelAlbumRegionPage } from "@/pages/travel-album-region/ui/TravelAlbumRegionPage"

export const Route = createFileRoute("/travel-album/$region")({
  component: RouteComponent,
})

function RouteComponent() {
  const { region } = Route.useParams()
  return <TravelAlbumRegionPage region={region} />
}
