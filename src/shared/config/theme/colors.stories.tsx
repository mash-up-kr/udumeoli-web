import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta = {
  title: "Foundations/Color",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: { description: { component: "서비스 전체 컬러 팔레트 (Design System v1.0.0)." } },
  },
}
export default meta
type Story = StoryObj

type Swatch = { cls: string; step: string; hex: string }

const NEUTRAL: Array<Swatch> = [
  { cls: "bg-neutral-0", step: "0", hex: "#FFFFFF" },
  { cls: "bg-neutral-50", step: "50", hex: "#F7F8FA" },
  { cls: "bg-neutral-100", step: "100", hex: "#EFF1F5" },
  { cls: "bg-neutral-150", step: "150", hex: "#E4E7ED" },
  { cls: "bg-neutral-200", step: "200", hex: "#D5D9E2" },
  { cls: "bg-neutral-300", step: "300", hex: "#B2B8C6" },
  { cls: "bg-neutral-400", step: "400", hex: "#8E96A9" },
  { cls: "bg-neutral-500", step: "500", hex: "#6B7384" },
  { cls: "bg-neutral-600", step: "600", hex: "#4F5566" },
  { cls: "bg-neutral-700", step: "700", hex: "#363D4E" },
  { cls: "bg-neutral-800", step: "800", hex: "#232936" },
  { cls: "bg-neutral-900", step: "900", hex: "#141820" },
]

const BLUE: Array<Swatch> = [
  { cls: "bg-blue-50", step: "50", hex: "#F0F8FE" },
  { cls: "bg-blue-100", step: "100", hex: "#D1EAFD" },
  { cls: "bg-blue-200", step: "200", hex: "#BBE0FC" },
  { cls: "bg-blue-300", step: "300", hex: "#9DD2FB" },
  { cls: "bg-blue-400", step: "400", hex: "#89C9FA" },
  { cls: "bg-blue-500", step: "500", hex: "#6CBCF9" },
  { cls: "bg-blue-600", step: "600", hex: "#62ABE3" },
  { cls: "bg-blue-700", step: "700", hex: "#4D85B1" },
  { cls: "bg-blue-800", step: "800", hex: "#3B6789" },
  { cls: "bg-blue-900", step: "900", hex: "#2D4F69" },
]

const RED: Array<Swatch> = [
  { cls: "bg-red-50", step: "50", hex: "#FFF2F1" },
  { cls: "bg-red-100", step: "100", hex: "#FFC5BF" },
  { cls: "bg-red-500", step: "500", hex: "#E8453A" },
  { cls: "bg-red-600", step: "600", hex: "#C42E24" },
]

const SINGLES: Array<Swatch> = [
  { cls: "bg-orange-100", step: "Orange 100", hex: "#FFDAB5" },
  { cls: "bg-yellow-100", step: "Yellow 100", hex: "#FFF0B1" },
  { cls: "bg-green-100", step: "Green 100", hex: "#C8F0C0" },
  { cls: "bg-indigo-100", step: "Indigo 100", hex: "#C4C8FF" },
  { cls: "bg-violet-100", step: "Violet 100", hex: "#E4BFFF" },
]

function Row({ title, items }: { title: string; items: Array<Swatch> }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-h6">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((s) => (
          <div key={s.cls} className="flex w-24 flex-col gap-1">
            <div className={`h-14 rounded-md border border-border ${s.cls}`} />
            <span className="text-b7">{s.step}</span>
            <span className="text-b8 text-muted-foreground">{s.hex}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export const Palette: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <Row title="Neutral" items={NEUTRAL} />
      <Row title="Blue" items={BLUE} />
      <Row title="Red" items={RED} />
      <Row title="Accent" items={SINGLES} />
    </div>
  ),
}
