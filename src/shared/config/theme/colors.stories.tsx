import type { ReactNode } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta = {
  title: "Foundations/Color",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "서비스 전체 컬러 팔레트 (Design System v1.0.0).",
      },
    },
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

// 앱 전용 색 (Figma primitive/semantic 외 · 추후 확정 시 교체)
const APP: Array<Swatch> = [
  { cls: "bg-highlight", step: "highlight", hex: "#F45B69" },
  { cls: "bg-success", step: "success", hex: "#22C55E" },
  { cls: "bg-warning", step: "warning", hex: "#F59E0B" },
  { cls: "bg-error", step: "error", hex: "#F33838" },
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
      <Row title="App" items={APP} />
    </div>
  ),
}

/* ===== Semantic Color =====
 * 이름 규칙: color-<property: bg|fg|stroke>-<role>-<variant>[-state]
 * Tailwind JIT가 감지하도록 전체 유틸 클래스를 리터럴로 나열. */
type SemToken = { cls: string; name: string; ref: string }

const BG_SEMANTIC: Array<SemToken> = [
  { cls: "bg-bg-neutral-weak", name: "bg-neutral-weak", ref: "neutral-0" },
  {
    cls: "bg-bg-neutral-weak-disabled",
    name: "bg-neutral-weak-disabled",
    ref: "neutral-50",
  },
  { cls: "bg-bg-neutral-subtle", name: "bg-neutral-subtle", ref: "neutral-50" },
  {
    cls: "bg-bg-neutral-subtle-disabled",
    name: "bg-neutral-subtle-disabled",
    ref: "neutral-100",
  },
  { cls: "bg-bg-neutral-solid", name: "bg-neutral-solid", ref: "neutral-100" },
  {
    cls: "bg-bg-neutral-inverse",
    name: "bg-neutral-inverse",
    ref: "neutral-800",
  },
  {
    cls: "bg-bg-neutral-inverse-disabled",
    name: "bg-neutral-inverse-disabled",
    ref: "neutral-300",
  },
  { cls: "bg-bg-brand-weak", name: "bg-brand-weak", ref: "blue-50" },
  { cls: "bg-bg-brand-solid", name: "bg-brand-solid", ref: "blue-500" },
  { cls: "bg-bg-danger-solid", name: "bg-danger-solid", ref: "red-500" },
  {
    cls: "bg-bg-danger-solid-disabled",
    name: "bg-danger-solid-disabled",
    ref: "neutral-200",
  },
  { cls: "bg-bg-dim-solid", name: "bg-dim-solid", ref: "neutral-900 · 50%" },
  { cls: "bg-bg-layer-basement", name: "bg-layer-basement", ref: "neutral-0" },
]

const FG_SEMANTIC: Array<SemToken> = [
  {
    cls: "text-fg-neutral-subtle",
    name: "fg-neutral-subtle",
    ref: "neutral-400",
  },
  {
    cls: "text-fg-neutral-solid",
    name: "fg-neutral-solid",
    ref: "neutral-600",
  },
  { cls: "text-fg-neutral-bold", name: "fg-neutral-bold", ref: "neutral-800" },
  {
    cls: "text-fg-neutral-bold-disabled",
    name: "fg-neutral-bold-disabled",
    ref: "neutral-300",
  },
  {
    cls: "text-fg-neutral-inverse",
    name: "fg-neutral-inverse",
    ref: "neutral-0",
  },
  {
    cls: "text-fg-neutral-inverse-disabled",
    name: "fg-neutral-inverse-disabled",
    ref: "neutral-500",
  },
  { cls: "text-fg-brand-solid", name: "fg-brand-solid", ref: "blue-500" },
  { cls: "text-fg-danger-solid", name: "fg-danger-solid", ref: "red-500" },
]

const STROKE_SEMANTIC: Array<SemToken> = [
  {
    cls: "border-stroke-neutral-weak",
    name: "stroke-neutral-weak",
    ref: "neutral-150",
  },
  {
    cls: "border-stroke-neutral-subtle",
    name: "stroke-neutral-subtle",
    ref: "neutral-300",
  },
  {
    cls: "border-stroke-neutral-subtle-disabled",
    name: "stroke-neutral-subtle-disabled",
    ref: "neutral-150",
  },
  {
    cls: "border-stroke-neutral-bold",
    name: "stroke-neutral-bold",
    ref: "neutral-800",
  },
  {
    cls: "border-stroke-neutral-inverse",
    name: "stroke-neutral-inverse",
    ref: "neutral-0",
  },
  {
    cls: "border-stroke-danger-subtle",
    name: "stroke-danger-subtle",
    ref: "red-100",
  },
  {
    cls: "border-stroke-danger-solid",
    name: "stroke-danger-solid",
    ref: "red-500",
  },
]

function SemCell({ token, chip }: { token: SemToken; chip: ReactNode }) {
  return (
    <div className="flex w-40 flex-col gap-1">
      {chip}
      <span className="text-b7">{token.name}</span>
      <span className="text-b8 text-muted-foreground">{token.ref}</span>
    </div>
  )
}

function SemGroup({
  title,
  items,
  kind,
}: {
  title: string
  items: Array<SemToken>
  kind: "bg" | "fg" | "stroke"
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-h6">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {items.map((t) => (
          <SemCell
            key={t.cls}
            token={t}
            chip={
              kind === "bg" ? (
                <div
                  className={`h-14 rounded-md border border-border ${t.cls}`}
                />
              ) : kind === "fg" ? (
                <div className="flex h-14 items-center justify-center rounded-md bg-neutral-300">
                  <span className={`text-h4 ${t.cls}`}>Ag가</span>
                </div>
              ) : (
                <div
                  className={`h-14 rounded-md border-4 bg-neutral-100 ${t.cls}`}
                />
              )
            }
          />
        ))}
      </div>
    </div>
  )
}

export const Semantic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "용도별 시맨틱 토큰 (Design System v1.0.0). primitive를 참조합니다.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-8">
      <SemGroup title="Background — color-bg-*" items={BG_SEMANTIC} kind="bg" />
      <SemGroup title="Foreground — color-fg-*" items={FG_SEMANTIC} kind="fg" />
      <SemGroup
        title="Stroke — color-stroke-*"
        items={STROKE_SEMANTIC}
        kind="stroke"
      />
    </div>
  ),
}
