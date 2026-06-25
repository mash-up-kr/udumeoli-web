import { ArrowLeft, Plus } from "lucide-react"

import { Button } from "./button"
import type { ReactNode } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ["autodocs"],
  args: { children: "버튼" },
  parameters: {
    docs: {
      description: {
        component: [
          "재사용 버튼. 배경(variant) · 테두리 굴곡(radius) · 그림자(shadow) · 크기(size)를 조합해 시안의 모든 버튼을 표현합니다.",
          "",
          "- `variant`: `solid`(배경O·다크) · `surface`(흰 배경) · `text`(배경X·글자/아이콘만) + 보조(outline/secondary/destructive/link/kakao)",
          "- `radius`: `md`(12) · `lg`(24) · `full`(완전 둥금)",
          "- `shadow`: `none` · `sm` · `lg`",
          "- 풀폭 CTA는 `w-full` + 부모 좌우 패딩으로 반응형 처리.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "surface", "text", "outline", "secondary", "destructive", "link", "kakao"],
      description: "배경 스타일.",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "xl", "cta", "icon", "icon-sm", "icon-lg"],
      description: "크기. cta는 풀폭 CTA(h61)용, icon* 은 정사각 아이콘 버튼.",
    },
    radius: {
      control: "inline-radio",
      options: ["md", "lg", "full"],
      description: "테두리 굴곡.",
    },
    shadow: {
      control: "inline-radio",
      options: ["none", "sm", "lg"],
      description: "그림자.",
    },
    disabled: { control: "boolean", description: "클릭 불가 상태." },
  },
}
export default meta
type Story = StoryObj<typeof Button>

export const Playground: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="solid">solid</Button>
      <Button variant="surface" shadow="sm">
        surface
      </Button>
      <Button variant="text">text</Button>
      <Button variant="outline">outline</Button>
      <Button variant="secondary">secondary</Button>
      <Button variant="destructive">destructive</Button>
      <Button variant="kakao">kakao</Button>
    </div>
  ),
}

export const Radius: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button radius="md">md · 12</Button>
      <Button radius="lg">lg · 24</Button>
      <Button radius="full">full</Button>
    </div>
  ),
}

export const Shadow: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button shadow="none">none</Button>
      <Button shadow="sm">sm</Button>
      <Button shadow="lg">lg</Button>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>기본</Button>
      <Button disabled>비활성화</Button>
    </div>
  ),
}

/** 풀폭 CTA(#6). 버튼은 `w-full`, 좌우 20px 여백은 부모 `px-5`가 담당 → 화면 폭에 맞춰 반응형. */
export const FullWidthCTA: Story = {
  render: () => (
    <div className="w-[375px] bg-muted px-5 py-4">
      <Button size="cta" radius="md" className="w-full">
        카카오로 시작하기
      </Button>
    </div>
  ),
}

/** 시안 4종을 하나의 Button 조합으로 재현. */
export const 시안_버튼들: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Figure label="#6 풀폭 CTA · solid / radius=md">
        <div className="w-[335px]">
          <Button size="cta" radius="md" className="w-full">
            카카오로 시작하기
          </Button>
        </div>
      </Figure>

      <Figure label="#10 pill · solid / radius=full / shadow=lg">
        <Button radius="full" shadow="lg" className="h-[61px] w-[227px]">
          여행 사진 추가하기
        </Button>
      </Figure>

      <Figure label="#8 아이콘(배경O) · solid / radius=lg">
        <Button size="icon" radius="lg" className="size-[52px]" aria-label="추가">
          <Plus className="size-6" />
        </Button>
      </Figure>

      <Figure label="#12 아이콘(흰 배경) · surface / radius=full / shadow=sm">
        <Button variant="surface" size="icon" radius="full" shadow="sm" className="size-[42px]" aria-label="뒤로 가기">
          <ArrowLeft className="size-5" />
        </Button>
      </Figure>

      <Figure label="텍스트 버튼 · text">
        <Button variant="text">완료</Button>
      </Figure>

      <Figure label="아이콘(배경X) · text">
        <Button variant="text" size="icon" aria-label="뒤로 가기">
          <ArrowLeft className="size-5" />
        </Button>
      </Figure>
    </div>
  ),
}

function Figure({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}
