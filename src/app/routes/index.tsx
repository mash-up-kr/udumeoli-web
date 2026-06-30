import { createFileRoute } from "@tanstack/react-router"
import { LandingPage } from "@/pages/landing/ui/LandingPage"

export const Route = createFileRoute("/")({ component: LandingPage })
