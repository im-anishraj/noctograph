import type { Meta, StoryObj } from "@storybook/react-vite";
import { EventCard } from "./EventCard.js";

const meta = { component: EventCard } satisfies Meta<typeof EventCard>;
export default meta;

type Story = StoryObj<typeof meta>;

export const CommandRun: Story = {
  args: {
    event: {
      id: "evt_1",
      ts: "2026-05-17T00:00:00.000Z",
      sessionId: "session_1",
      type: "CommandRun",
      payload: { command: "pnpm", args: ["test"], cwd: "/repo" }
    }
  }
};

export const FileSnapshot: Story = {
  args: {
    event: {
      id: "evt_2",
      ts: "2026-05-17T00:00:01.000Z",
      sessionId: "session_1",
      type: "FileSnapshot",
      payload: { path: "src/app.ts", phase: "after", exists: true, content: "after", diff: "@@ -1 +1 @@\n-before\n+after", hash: "sha256:abc" }
    }
  }
};
