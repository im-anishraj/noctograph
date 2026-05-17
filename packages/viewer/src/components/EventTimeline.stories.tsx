import type { Meta, StoryObj } from "@storybook/react-vite";
import { EventTimeline } from "./EventTimeline.js";

const meta = { component: EventTimeline } satisfies Meta<typeof EventTimeline>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Timeline: Story = {
  args: {
    events: [
      {
        id: "evt_1",
        ts: "2026-05-17T00:00:00.000Z",
        sessionId: "session_1",
        type: "CommandOutput",
        payload: { stream: "stdout", text: "ok", raw: "ok", truncated: false }
      }
    ]
  }
};
