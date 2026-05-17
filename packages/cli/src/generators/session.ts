import { RiskDetector, type BlackboxEvent, type RiskFinding, blackboxEventSchema } from "@agent-blackbox/core";

export interface FileChangeSummary {
  path: string;
  added: number;
  removed: number;
}

export interface SessionReportData {
  events: BlackboxEvent[];
  risk: {
    score: number;
    findings: RiskFinding[];
  };
  metrics: {
    durationMs: number;
    filesChanged: number;
    commandsRun: number;
    testsRun: number;
    testsPassed: number;
    testsFailed: number;
  };
  files: FileChangeSummary[];
  command: string;
}

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

export function summarizeFiles(events: BlackboxEvent[]): FileChangeSummary[] {
  const files = new Map<string, FileChangeSummary>();

  for (const event of events) {
    if (event.type !== "FileSnapshot") {
      continue;
    }

    const current = files.get(event.payload.path) ?? { path: event.payload.path, added: 0, removed: 0 };
    const counts = diffCounts(event.payload.diff);
    current.added += counts.added;
    current.removed += counts.removed;
    files.set(event.payload.path, current);
  }

  return [...files.values()].sort((a, b) => a.path.localeCompare(b.path));
}

function diffCounts(diff: string | null): { added: number; removed: number } {
  const lines = (diff ?? "").split(/\r?\n/);
  return {
    added: lines.filter((line) => line.startsWith("+") && !line.startsWith("+++")).length,
    removed: lines.filter((line) => line.startsWith("-") && !line.startsWith("---")).length
  };
}
