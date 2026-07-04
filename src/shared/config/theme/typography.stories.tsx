import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta = {
  title: "Foundations/Typography",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "타입 시스템 — KOR(text-h0~h9, text-b0~b8) · ENG(font-eng + text-e0~e4). size/weight/line-height/letter-spacing 포함.",
      },
    },
  },
}
export default meta
type Story = StoryObj

type Type = { name: string; cls: string; spec: string }

const HEAD: Array<Type> = [
  { name: "H0", cls: "text-h0", spec: "36 · 700 · 48 · -0.2" },
  { name: "H1", cls: "text-h1", spec: "32 · 700 · 44 · -0.2" },
  { name: "H2", cls: "text-h2", spec: "28 · 700 · 40 · -0.2" },
  { name: "H3", cls: "text-h3", spec: "24 · 700 · 36 · -0.2" },
  { name: "H3-1", cls: "text-h3-1", spec: "24 · 600 · 36 · -0.2" },
  { name: "H4", cls: "text-h4", spec: "20 · 600 · 28 · -0.2" },
  { name: "H5", cls: "text-h5", spec: "18 · 700 · 28 · -0.2" },
  { name: "H5-1", cls: "text-h5-1", spec: "18 · 600 · 28 · -0.2" },
  { name: "H6", cls: "text-h6", spec: "16 · 700 · 24 · -0.1" },
  { name: "H6-1", cls: "text-h6-1", spec: "16 · 600 · 24 · -0.1" },
  { name: "H7", cls: "text-h7", spec: "15 · 700 · 24 · -0.1" },
  { name: "H8", cls: "text-h8", spec: "14 · 700 · 20 · -0.1" },
  { name: "H8-1", cls: "text-h8-1", spec: "14 · 600 · 20 · -0.1" },
  { name: "H9", cls: "text-h9", spec: "13 · 600 · 20 · -0.1" },
]

const BODY: Array<Type> = [
  { name: "B0", cls: "text-b0", spec: "28 · 500 · 40 · -0.2" },
  { name: "B1", cls: "text-b1", spec: "24 · 500 · 36 · -0.2" },
  { name: "B2", cls: "text-b2", spec: "20 · 500 · 28 · -0.2" },
  { name: "B3", cls: "text-b3", spec: "18 · 500 · 24 · -0.2" },
  { name: "B4", cls: "text-b4", spec: "16 · 500 · 24 · -0.1" },
  { name: "B5", cls: "text-b5", spec: "15 · 500 · 24 · -0.1" },
  { name: "B6", cls: "text-b6", spec: "14 · 500 · 20 · -0.1" },
  { name: "B7", cls: "text-b7", spec: "13 · 400 · 20 · -0.1" },
  { name: "B8", cls: "text-b8", spec: "12 · 400 · 16 · -0.1" },
]

// ENG: font-eng(Special Gothic Condensed One) + text-e0~e4. spec = size · weight · lineHeight · letterSpacing
const ENG: Array<Type> = [
  { name: "E0", cls: "text-e0", spec: "44 · 400 · 44 · 0" },
  { name: "E1", cls: "text-e1", spec: "36 · 400 · 36 · 0" },
  { name: "E2", cls: "text-e2", spec: "20 · 400 · 20 · 0" },
  { name: "E3", cls: "text-e3", spec: "16 · 400 · 16 · 0" },
  { name: "E4", cls: "text-e4", spec: "12 · 400 · 16 · 0" },
]

const SAMPLE = "친구들과 함께 여행 서비스"
const SAMPLE_ENG = "TRAVEL with Friends"

function Section({
  title,
  items,
  sample = SAMPLE,
  fontCls = "",
}: {
  title: string
  items: Array<Type>
  sample?: string
  fontCls?: string
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-h3">{title}</h2>
      {items.map((t) => (
        <div
          key={t.name}
          className="flex items-baseline gap-4 border-b border-border pb-3"
        >
          <span className="w-12 shrink-0 text-b7 text-muted-foreground">
            {t.name}
          </span>
          <span className="w-40 shrink-0 text-b8 text-muted-foreground">
            {t.spec}
          </span>
          <span className={`${fontCls} ${t.cls}`}>{sample}</span>
        </div>
      ))}
    </div>
  )
}

export const Head: Story = {
  render: () => <Section title="Head" items={HEAD} />,
}
export const Body: Story = {
  render: () => <Section title="Body" items={BODY} />,
}
export const English: Story = {
  render: () => (
    <Section
      title="English"
      items={ENG}
      sample={SAMPLE_ENG}
      fontCls="font-eng"
    />
  ),
}
