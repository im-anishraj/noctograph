import type { Meta, StoryObj } from "@storybook/react-vite";
import { DiffView } from "./DiffView.js";

const meta = { component: DiffView } satisfies Meta<typeof DiffView>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Diff: Story = {
  args: {
    diff: "diff --git a/a.ts b/a.ts\n--- a/a.ts\n+++ b/a.ts\n@@ -1 +1 @@\n-before\n+after"
  }
};
