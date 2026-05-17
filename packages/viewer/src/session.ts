import { RiskDetector, blackboxEventSchema, type BlackboxEvent } from "nactograph-core";
import type { FileChangeSummary, SessionReportData } from "./types.js";

export function parseJsonlEvents(jsonl: string): BlackboxEvent[] {
  return jsonl
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => blackboxEventSchema.parse(JSON.parse(line)));
}

export function createSessionReportData(events: BlackboxEvent[]): SessionReportData {
  const risk = new RiskDetector().detect(events);
  const sessionStart = events.find((event) => event.type === "SessionStart");
  const sessionEnd = events.find((event) => event.type === "SessionEnd");
  const tests = events.filter((event) => event.type === "TestRun");
  const files = summarizeFiles(events);

  return {
    events,
    risk,
    metrics: {
      durationMs: sessionEnd?.payload.durationMs ?? 0,
      filesChanged: files.length,
      commandsRun: events.filter((event) => event.type === "CommandRun").length,
      testsRun: tests.length,
      testsPassed: tests.filter((event) => event.payload.status === "passed").length,
      testsFailed: tests.filter((event) => event.payload.status === "failed").length
    },
    files,
    command: sessionStart?.payload.command.join(" ") ?? "unknown command"
  };
}

function summarizeFiles(events: BlackboxEvent[]): FileChangeSummary[] {
  const files = new Map<string, FileChangeSummary>();

  for (const event of events) {
    if (event.type !== "FileSnapshot") {
      continue;
    }

    const current = files.get(event.payload.path) ?? { path: event.payload.path, added: 0, removed: 0 };
    const diff = event.payload.diff ?? "";
    current.added += diff.split(/\r?\n/).filter((line) => line.startsWith("+") && !line.startsWith("+++")).length;
    current.removed += diff.split(/\r?\n/).filter((line) => line.startsWith("-") && !line.startsWith("---")).length;
    files.set(event.payload.path, current);
  }

  return [...files.values()].sort((a, b) => a.path.localeCompare(b.path));
}
