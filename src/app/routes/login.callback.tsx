import { createFileRoute } from "@tanstack/react-router"
import { LoginCallbackPage } from "@/pages/login-callback/ui/LoginCallbackPage"

export const Route = createFileRoute("/login/callback")({
  component: LoginCallbackPage,
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search.code === "string" ? search.code : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
  }),
})
