import type { Meta, StoryObj } from "@storybook/react-vite";
import { RiskSidebar } from "./RiskSidebar.js";

const meta = { component: RiskSidebar } satisfies Meta<typeof RiskSidebar>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Findings: Story = {
  args: {
    findings: [
      { rule: "destructive_command", severity: "high", evidence: "git push --force", timestamp: "2026-05-17T00:00:00.000Z" },
      { rule: "dependency_added", severity: "medium", evidence: "Added left-pad", timestamp: "2026-05-17T00:00:01.000Z" }
    ]
  }
};
