import { ImageContainer } from "./image-container"
import type { Meta, StoryObj } from "@storybook/react-vite"
import sampleImageSrc from "@/shared/assets/sample.jpeg"

const meta: Meta<typeof ImageContainer> = {
  component: ImageContainer,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          '이미지 최적화 공통 컨테이너. `loading="lazy"` 기본 적용. 크기·radius는 className으로 외부에서 제어.',
      },
    },
  },
  argTypes: {
    aspectRatio: {
      control: "inline-radio",
      options: ["square", "video", "portrait"],
      description: "비율. square(1:1) · video(16:9) · portrait(3:4)",
    },
    src: { control: "text", description: "이미지 URL." },
    alt: { control: "text", description: "이미지 설명." },
  },
  args: {
    src: sampleImageSrc,
    alt: "샘플 이미지",
    aspectRatio: "square",
  },
  decorators: [
    (Story) => (
      <div className="w-25.75">
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof ImageContainer>

export const Default: Story = {}

/** aspect-ratio 3종. */
export const AspectRatios: Story = {
  render: () => (
    <div className="flex items-start gap-4">
      <ImageContainer
        src={sampleImageSrc}
        alt="해변"
        aspectRatio="square"
        className="w-25.75"
      />
      <ImageContainer
        src={sampleImageSrc}
        alt="해변"
        aspectRatio="video"
        className="w-25.75"
      />
      <ImageContainer
        src={sampleImageSrc}
        alt="해변"
        aspectRatio="portrait"
        className="w-25.75"
      />
    </div>
  ),
}

/** 이미지 없는 빈 상태 (fallback 배경색). */
export const Empty: Story = {
  args: { src: undefined },
}

/** 잘못된 URL — 에러 fallback. */
export const Error: Story = {
  args: { src: "https://invalid.url/image.jpg" },
}

/** 피그마 #601-5352 — 우상단 X 버튼 포함. */
export const WithRemoveButton: Story = {
  render: () => (
    <ImageContainer
      src={sampleImageSrc}
      alt="해변"
      aspectRatio="square"
      className="w-25.75"
      onRemove={() => alert("제거")}
    />
  ),
}
