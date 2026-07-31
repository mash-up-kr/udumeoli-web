import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router"

import { MyPagePage } from "@/pages/my-page/ui/MyPagePage"

function MyPageRouteComponent() {
  const pathname = useLocation({ select: (location) => location.pathname })

  if (pathname === "/my-page") return <MyPagePage />
  return <Outlet />
}

export const Route = createFileRoute("/my-page")({
  component: MyPageRouteComponent,
})
