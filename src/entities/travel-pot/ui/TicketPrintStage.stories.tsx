import { TicketCard } from "./TicketCard"
import { TicketPrintStage } from "./TicketPrintStage"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof TicketPrintStage> = {
  component: TicketPrintStage,
  title: "Entities/TravelPot/TicketPrintStage",
  parameters: { layout: "fullscreen" },
}
export default meta
type Story = StoryObj<typeof TicketPrintStage>

export const Default: Story = {
  render: () => (
    <div className="relative h-[812px] w-[375px] overflow-hidden bg-bg-neutral-subtle">
      <TicketPrintStage>
        <TicketCard name="서울" leaderName="우두머리" seatLabel="01">
          <div aria-hidden="true" className="flex gap-[6px]">
            {"d0wveq".split("").map((char, index) => (
              <span
                key={index}
                className="flex h-[34px] w-[28px] items-center justify-center rounded-[8px] border border-neutral-200 bg-neutral-100 font-eng text-e3 text-neutral-900"
              >
                {char}
              </span>
            ))}
          </div>
          <p className="text-h9 text-neutral-900">
            함께 여행할 친구들을 초대해 보세요!
          </p>
        </TicketCard>
      </TicketPrintStage>
    </div>
  ),
}
