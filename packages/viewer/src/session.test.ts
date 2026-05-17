import { describe, expect, it } from "vitest";
import { createSessionReportData, parseJsonlEvents } from "./session.js";

describe("viewer session helpers", () => {
  it("loads JSONL into report data", () => {
    const events = parseJsonlEvents(
      [
        JSON.stringify({
          id: "evt_1",
          ts: "2026-05-17T00:00:00.000Z",
          sessionId: "session_1",
          type: "SessionStart",
          payload: { command: ["codex", "fix"], cwd: "/repo", gitHead: "abc", outputDir: "/repo/out", redact: true }
        }),
        JSON.stringify({
          id: "evt_2",
          ts: "2026-05-17T00:00:01.000Z",
          sessionId: "session_1",
          type: "SessionEnd",
          payload: { exitCode: 0, signal: null, durationMs: 1000 }
        })
      ].join("\n")
    );

    expect(createSessionReportData(events)).toMatchObject({
      command: "codex fix",
      metrics: { durationMs: 1000 }
    });
  });
});
