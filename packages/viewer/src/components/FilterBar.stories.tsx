import type { Meta, StoryObj } from "@storybook/react-vite";
import { FilterBar } from "./FilterBar.js";

const meta = { component: FilterBar } satisfies Meta<typeof FilterBar>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    events: [],
    eventType: "All",
    severity: "All",
    query: "",
    onEventTypeChange: () => {},
    onSeverityChange: () => {},
    onQueryChange: () => {}
  }
};
