import { describe, expect, it } from "vitest";
import { generateHtmlReport } from "./html.js";
import { generateMarkdownReport } from "./markdown.js";
import { createSessionReportData, parseJsonlEvents } from "./session.js";

const jsonl = [
  {
    id: "evt_1",
    ts: "2026-05-17T00:00:00.000Z",
    sessionId: "session_1",
    type: "SessionStart",
    payload: { command: ["codex", "fix tests"], cwd: "/repo", gitHead: "abc", outputDir: "/repo/blackbox-sessions", redact: true }
  },
  {
    id: "evt_2",
    ts: "2026-05-17T00:00:01.000Z",
    sessionId: "session_1",
    type: "CommandRun",
    payload: { command: "pnpm", args: ["test"], cwd: "/repo" }
  },
  {
    id: "evt_3",
    ts: "2026-05-17T00:00:02.000Z",
    sessionId: "session_1",
    type: "FileSnapshot",
    payload: { path: "src/auth.ts", phase: "after", exists: true, content: "after", diff: "@@ -1 +1 @@\n-before\n+after", hash: "sha256:abc" }
  },
  {
    id: "evt_4",
    ts: "2026-05-17T00:00:03.000Z",
    sessionId: "session_1",
    type: "RiskyAction",
    payload: { rule: "demo", severity: "medium", description: "demo", evidence: "demo" }
  },
  {
    id: "evt_5",
    ts: "2026-05-17T00:00:04.000Z",
    sessionId: "session_1",
    type: "SessionEnd",
    payload: { exitCode: 0, signal: null, durationMs: 4000 }
  }
]
  .map((event) => JSON.stringify(event))
  .join("\n");

describe("report generators", () => {
  it("generates a markdown PR comment snapshot", () => {
    const markdown = generateMarkdownReport(createSessionReportData(parseJsonlEvents(jsonl)));

    expect(markdown).toMatchInlineSnapshot(`
      "## Agent Blackbox Session Report

      | Metric | Value |
      |---|---|
      | Duration | 4.0s |
      | Files changed | 1 |
      | Commands run | 1 |
      | Tests run | 0 (0 passed, 0 failed) |
      | Risk score | 0/100 |

      ### Risk findings

      _No risk findings._

      ### Files changed

      - \`src/auth.ts\` (+1/-1)

      ### Full timeline

      - 2026-05-17T00:00:00.000Z \`SessionStart\`
      - 2026-05-17T00:00:01.000Z \`CommandRun\`
      - 2026-05-17T00:00:02.000Z \`FileSnapshot\`
      - 2026-05-17T00:00:03.000Z \`RiskyAction\`
      - 2026-05-17T00:00:04.000Z \`SessionEnd\`
      "
    `);
  });

  it("generates an HTML report with embedded session data", () => {
    const html = generateHtmlReport(createSessionReportData(parseJsonlEvents(jsonl)));

    expect(html).toContain("window.__BLACKBOX_SESSION__");
    expect(html).toContain("Agent Blackbox Session");
    expect(html).toMatchSnapshot();
  });
});
