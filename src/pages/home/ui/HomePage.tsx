import { Header } from "@/shared/ui/header"
import { MobileLayout } from "@/shared/ui/mobile-layout"

export function HomePage() {
  return (
    <MobileLayout>
      <Header>
        <Header.Title>우두머리</Header.Title>
      </Header>
      <main className="p-4">{/* 여행 피드 */}</main>
    </MobileLayout>
  )
}
