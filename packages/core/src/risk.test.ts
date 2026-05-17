import { describe, expect, it } from "vitest";
import { RiskDetector, type BlackboxEvent, type RiskRuleId } from "./index.js";

const detector = new RiskDetector();
const ts = "2026-05-17T00:00:00.000Z";

describe("RiskDetector", () => {
  it.each([
    ["secret_access", [fileSnapshot(".env", true)]],
    ["lockfile_churn", [fileSnapshot("yarn.lock", true), fileSnapshot("yarn.lock", true), fileSnapshot("yarn.lock", true)]],
    ["dependency_added", [dependencyChange("added")]],
    ["dependency_removed", [dependencyChange("removed")]],
    ["test_deleted", [fileSnapshot("auth.test.ts", false)]],
    ["test_failure_loop", [testRun("failed"), testRun("failed"), testRun("failed")]],
    ["scope_creep", [sessionStart(), fileSnapshot("../outside.ts", true)]],
    ["destructive_command", [commandRun("rm", ["-rf", "dist"])]],
    ["license_change", [fileSnapshot("LICENSE", true)]],
    ["env_write", [fileSnapshot(".env.local", true)]],
    ["large_deletion", [fileSnapshot("src/app.ts", true, largeDeletionDiff())]]
  ] satisfies [RiskRuleId, BlackboxEvent[]][])("detects %s", (rule, events) => {
    expect(detector.detect(events).findings.some((finding) => finding.rule === rule)).toBe(true);
  });

  it("scores findings from 0 to 100 and sorts by severity", () => {
    const report = detector.detect([fileSnapshot(".env", true), commandRun("rm", ["-rf", "dist"]), dependencyChange("added")]);

    expect(report.score).toBe(100);
    expect(report.findings[0]?.severity).toBe("high");
  });

  it("parses completed JSONL sessions", () => {
    const event = commandRun("git", ["push", "--force"]);
    const report = detector.detectJsonl(`${JSON.stringify(event)}\n`);

    expect(report.findings[0]).toMatchObject({ rule: "destructive_command" });
  });
});

function base(type: BlackboxEvent["type"], payload: BlackboxEvent["payload"]): BlackboxEvent {
  return { id: `evt_${Math.random()}`, ts, sessionId: "session_1", type, payload } as BlackboxEvent;
}

function sessionStart(): BlackboxEvent {
  return base("SessionStart", { command: ["codex"], cwd: "/repo", gitHead: "abc", outputDir: "/repo/blackbox-sessions", redact: true });
}

function fileSnapshot(filePath: string, exists: boolean, diff: string | null = "@@ -1 +1 @@\n-before\n+after"): BlackboxEvent {
  return base("FileSnapshot", { path: filePath, phase: "after", exists, content: exists ? "content" : null, diff, hash: exists ? "sha256:abc" : null });
}

function dependencyChange(change: "added" | "removed"): BlackboxEvent {
  return base("DependencyChange", {
    manifestPath: "package.json",
    packageName: "left-pad",
    change,
    beforeVersion: change === "removed" ? "1.0.0" : null,
    afterVersion: change === "added" ? "1.0.0" : null
  });
}

function testRun(status: "failed" | "passed"): BlackboxEvent {
  return base("TestRun", { command: "pnpm test", status, exitCode: status === "failed" ? 1 : 0, durationMs: 100, output: status });
}

function commandRun(command: string, args: string[]): BlackboxEvent {
  return base("CommandRun", { command, args, cwd: "/repo" });
}

function largeDeletionDiff(): string {
  return ["diff --git a/a b/a", "--- a/a", "+++ b/a", ...Array.from({ length: 100 }, (_, index) => `-line ${index}`)].join("\n");
}
