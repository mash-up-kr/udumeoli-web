import { createFileRoute } from "@tanstack/react-router"
import { SignupPage } from "@/pages/signup/ui/SignupPage"

export const Route = createFileRoute("/signup")({ component: SignupPage })
