import { describe, expect, it } from "vitest";
import { artifacts, captureEvents, metrics, riskRules, workflowSteps } from "./content";

describe("landing page content", () => {
  it("keeps the core product proof visible", () => {
    expect(metrics).toHaveLength(4);
    expect(captureEvents).toContain("FileSnapshot");
    expect(riskRules).toContain("destructive_command");
    expect(artifacts.map((artifact) => artifact.name)).toEqual([
      "blackbox-report.html",
      "blackbox.jsonl",
      "blackbox-pr-comment.md"
    ]);
    expect(workflowSteps.at(0)?.title).toBe("Run agent");
  });
});
