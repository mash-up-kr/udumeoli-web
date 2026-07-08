import { Header } from "./header"
import { MobileLayout } from "./mobile-layout"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof MobileLayout> = {
  component: MobileLayout,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "모든 페이지를 감싸는 모바일 영역 컨테이너.",
          "",
          "- **기준 크기 375×812** (iPhone X). 이 크기에서 시안과 1:1로 보입니다.",
          "- 더 작은 폰(360 등)은 자동으로 줄어듭니다. (min 없음)",
          "- 더 큰 화면은 **최대 448px**(`max-w-md`)에서 멈추고 가운데 정렬됩니다.",
          "- 좌우 여백(거터)은 브랜드 틴트 aurora 그라디언트 배경이 균등하게 남고, 프레임은 앰비언트 섀도로 떠 보입니다.",
          "",
          "👉 상단 툴바의 **Viewport**를 바꿔가며 기기별로 확인하세요.",
        ].join("\n"),
      },
    },
    viewport: {
      options: {
        galaxyS: {
          name: "Galaxy S (360×800)",
          styles: { width: "360px", height: "800px" },
        },
        iphoneX: {
          name: "기준 · iPhone X (375×812)",
          styles: { width: "375px", height: "812px" },
        },
        proMax: {
          name: "iPhone Pro Max (430×932)",
          styles: { width: "430px", height: "932px" },
        },
        desktop: {
          name: "데스크탑 (1280×900)",
          styles: { width: "1280px", height: "900px" },
        },
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof MobileLayout>

const FEED = [
  {
    id: 1,
    title: "제주 3박 4일",
    desc: "성산일출봉 · 우도 · 협재",
    days: "4일",
  },
  {
    id: 2,
    title: "도쿄 미식 투어",
    desc: "츠키지 · 시부야 · 신주쿠",
    days: "3일",
  },
  { id: 3, title: "다낭 휴양", desc: "미케 비치 · 바나힐", days: "5일" },
]

function DemoContent() {
  return (
    <>
      <Header
        icon={false}
        title="우두머리"
        className="sticky top-0 z-10 border-b"
      />
      <main className="flex flex-col gap-3 p-4">
        {FEED.map((item) => (
          <article
            key={item.id}
            className="flex gap-3 rounded-lg border bg-card p-3"
          >
            <div className="size-16 shrink-0 rounded-md bg-muted" />
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{item.title}</span>
              <span className="truncate text-sm text-muted-foreground">
                {item.desc}
              </span>
              <span className="mt-auto text-xs text-muted-foreground">
                {item.days}
              </span>
            </div>
          </article>
        ))}
      </main>
    </>
  )
}

/** 기준 크기(375×812). 시안과 1:1로 보이는 상태입니다. */
export const 기준_모바일: Story = {
  globals: { viewport: { value: "iphoneX" } },
  render: () => (
    <MobileLayout>
      <DemoContent />
    </MobileLayout>
  ),
}

/**
 * 데스크탑/넓은 화면. 컨테이너는 448px에서 멈추고 가운데 정렬되며,
 * 좌우 거터에 브랜드 틴트 aurora 배경이 깔리고 프레임은 섀도로 떠 보입니다. (웹에서 보이는 모습)
 */
export const 웹_거터: Story = {
  globals: { viewport: { value: "desktop" } },
  render: () => (
    <MobileLayout>
      <DemoContent />
    </MobileLayout>
  ),
}
