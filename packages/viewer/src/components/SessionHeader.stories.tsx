import type { Meta, StoryObj } from "@storybook/react-vite";
import { SessionHeader } from "./SessionHeader.js";

const meta = { component: SessionHeader } satisfies Meta<typeof SessionHeader>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    session: {
      command: "codex fix failing auth tests",
      events: [],
      risk: { score: 35, findings: [] },
      files: [],
      metrics: { durationMs: 42000, filesChanged: 3, commandsRun: 4, testsRun: 2, testsPassed: 1, testsFailed: 1 }
    }
  }
};
