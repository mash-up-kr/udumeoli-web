import { AppHeader } from "@/widgets/app-header"
import { MobileLayout } from "@/shared/ui/mobile-layout"

const FEED = [
  { id: 1, title: "제주 3박 4일", desc: "성산일출봉 · 우도 · 협재", days: "4일" },
  { id: 2, title: "도쿄 미식 투어", desc: "츠키지 · 시부야 · 신주쿠", days: "3일" },
  { id: 3, title: "다낭 휴양", desc: "미케 비치 · 바나힐", days: "5일" },
  { id: 4, title: "부산 주말", desc: "광안리 · 감천문화마을", days: "2일" },
]

export function HomePage() {
  return (
    <MobileLayout>
      <AppHeader />

      <main className="flex flex-col gap-3 p-4">
        {FEED.map((item) => (
          <article
            key={item.id}
            className="flex gap-3 rounded-lg border bg-card p-3"
          >
            <div className="size-16 shrink-0 rounded-md bg-muted" />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-b4">{item.title}</span>
              <span className="truncate text-b7 text-muted-foreground">
                {item.desc}
              </span>
              <span className="mt-auto text-b8 text-muted-foreground">
                {item.days}
              </span>
            </div>
          </article>
        ))}
      </main>
    </MobileLayout>
  )
}
