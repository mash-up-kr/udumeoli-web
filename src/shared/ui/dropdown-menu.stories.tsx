import { Ban, Ellipsis } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import { ButtonIcon } from "./button-icon"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof DropdownMenu> = {
  component: DropdownMenu,
  tags: ["autodocs"],
}
export default meta
type Story = StoryObj<typeof DropdownMenu>
export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ButtonIcon aria-label="멤버 더보기">
          <Ellipsis />
        </ButtonIcon>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="text-fg-danger-solid">
          차단하기
          <Ban className="size-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}
