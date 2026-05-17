import type { Meta, StoryObj } from "@storybook/react-vite";
import { TerminalOutput } from "./TerminalOutput.js";

const meta = { component: TerminalOutput } satisfies Meta<typeof TerminalOutput>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Output: Story = {
  args: {
    text: "pnpm test\n✓ auth.test.ts"
  }
};
