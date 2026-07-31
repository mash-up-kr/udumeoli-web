import { createFileRoute } from "@tanstack/react-router"

import { MyPotEditPage } from "@/pages/my-page/ui/MyPotEditPage"

function MyPotEditRouteComponent() {
  const { potId } = Route.useParams()
  return <MyPotEditPage potId={potId} />
}

export const Route = createFileRoute("/my-page/pot/$potId")({
  component: MyPotEditRouteComponent,
})
