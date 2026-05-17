import { describe, expect, it } from "vitest";
import {
  blackboxEventJsonSchema,
  blackboxEventSchema,
  eventSchemas,
  parseBlackboxEvent,
  type BlackboxEvent
} from "./events.js";

const base = {
  id: "evt_1",
  ts: "2026-05-17T00:00:00.000Z",
  sessionId: "session_1"
};

const cases: BlackboxEvent[] = [
  {
    ...base,
    type: "SessionStart",
    payload: {
      command: ["codex", "fix tests"],
      cwd: "/repo",
      gitHead: "abc123",
      outputDir: "/repo/blackbox-sessions",
      redact: true
    }
  },
  {
    ...base,
    type: "SessionEnd",
    payload: { exitCode: 0, signal: null, durationMs: 1000 }
  },
  {
    ...base,
    type: "CommandRun",
    payload: { command: "pnpm", args: ["test"], cwd: "/repo" }
  },
  {
    ...base,
    type: "CommandOutput",
    payload: { stream: "stdout", text: "ok", raw: "\u001b[32mok\u001b[0m", truncated: false }
  },
  {
    ...base,
    type: "FileSnapshot",
    payload: {
      path: "src/auth.ts",
      phase: "after",
      exists: true,
      content: "export {};",
      diff: "@@ -1 +1 @@",
      hash: "sha256:abc"
    }
  },
  {
    ...base,
    type: "TestRun",
    payload: { command: "pnpm test", status: "passed", exitCode: 0, durationMs: 500, output: "pass" }
  },
  {
    ...base,
    type: "DependencyChange",
    payload: {
      manifestPath: "package.json",
      packageName: "zod",
      change: "added",
      beforeVersion: null,
      afterVersion: "^3.25.42"
    }
  },
  {
    ...base,
    type: "RiskyAction",
    payload: {
      rule: "destructive_command",
      severity: "high",
      description: "Destructive command detected",
      evidence: "rm -rf"
    }
  },
  {
    ...base,
    type: "AgentMessage",
    payload: { role: "agent", text: "I will inspect the tests." }
  },
  {
    ...base,
    type: "ErrorEvent",
    payload: { name: "Error", message: "Something failed", stack: "Error: Something failed" }
  }
];

describe("blackbox event schemas", () => {
  it.each(cases)("validates %s", (event) => {
    expect(blackboxEventSchema.parse(event)).toEqual(event);
    expect(eventSchemas[event.type].parse(event)).toEqual(event);
  });

  it("rejects invalid event shapes", () => {
    expect(() =>
      parseBlackboxEvent({
        ...base,
        type: "CommandOutput",
        payload: { stream: "stdin", text: "nope" }
      })
    ).toThrow();
  });

  it("exports a JSON schema for documentation", () => {
    const schema = blackboxEventJsonSchema();
    expect(schema).toMatchObject({
      $schema: "http://json-schema.org/draft-07/schema#",
      definitions: {
        BlackboxEvent: expect.any(Object)
      }
    });
  });
});
