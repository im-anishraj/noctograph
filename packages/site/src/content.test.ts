import { describe, expect, it } from "vitest";
import { artifactOutputs, captureMatrix, installCommand, navItems, proofStats, recorderEvents, riskFindings, terminalLines } from "./content";

describe("landing page content", () => {
  it("keeps the command-center story complete", () => {
    expect(installCommand).toBe("npm install -g nactograph");
    expect(navItems.map((item) => item.label)).toEqual(["Product", "Replay", "Risk", "Examples", "Docs", "GitHub"]);
    expect(proofStats).toHaveLength(4);
    expect(recorderEvents.map((event) => event.type)).toContain("FileSnapshot");
    expect(captureMatrix.map((event) => event.name)).toContain("RiskyAction");
    expect(riskFindings.map((risk) => risk.rule)).toContain("destructive_command");
    expect(artifactOutputs.map((artifact) => artifact.name)).toEqual(["blackbox-report.html", "blackbox.jsonl", "blackbox-pr-comment.md"]);
    expect(terminalLines.at(-1)).toContain("blackbox-report.html");
  });
});
