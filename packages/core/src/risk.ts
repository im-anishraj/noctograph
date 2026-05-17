import {
  blackboxEventSchema,
  type BlackboxEvent,
  type DependencyChangeEvent,
  type FileSnapshotEvent,
  type SessionStartEvent
} from "./events.js";
import { RedactionEngine } from "./redaction.js";

export type RiskSeverity = "low" | "medium" | "high";

export type RiskRuleId =
  | "secret_access"
  | "lockfile_churn"
  | "dependency_added"
  | "dependency_removed"
  | "test_deleted"
  | "test_failure_loop"
  | "scope_creep"
  | "destructive_command"
  | "license_change"
  | "env_write"
  | "large_deletion";

export interface RiskFinding {
  rule: RiskRuleId;
  severity: RiskSeverity;
  evidence: string;
  timestamp: string;
}

export interface RiskRule {
  id: RiskRuleId;
  severity: RiskSeverity;
  detect(events: BlackboxEvent[]): RiskFinding[];
}

export interface RiskReport {
  score: number;
  findings: RiskFinding[];
}

const severityScore: Record<RiskSeverity, number> = {
  low: 10,
  medium: 25,
  high: 40
};

export class RiskDetector {
  constructor(private readonly rules: RiskRule[] = defaultRiskRules()) {}

  detect(events: BlackboxEvent[]): RiskReport {
    const findings = this.rules.flatMap((rule) => rule.detect(events)).sort(compareFindings);
    const score = Math.min(
      100,
      findings.reduce((total, finding) => total + severityScore[finding.severity], 0)
    );

    return { score, findings };
  }

  detectJsonl(jsonl: string): RiskReport {
    const events = jsonl
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .map((line) => blackboxEventSchema.parse(JSON.parse(line)));

    return this.detect(events);
  }
}

export function defaultRiskRules(): RiskRule[] {
  const redactionEngine = new RedactionEngine();

  return [
    {
      id: "secret_access",
      severity: "high",
      detect(events) {
        return fileSnapshots(events)
          .filter((event) => redactionEngine.isSecretPath(event.payload.path))
          .map((event) => finding("secret_access", "high", `Secret-like file touched: ${event.payload.path}`, event.ts));
      }
    },
    {
      id: "lockfile_churn",
      severity: "medium",
      detect(events) {
        const counts = new Map<string, FileSnapshotEvent[]>();
        for (const event of fileSnapshots(events).filter((snapshot) => isLockfile(snapshot.payload.path))) {
          counts.set(event.payload.path, [...(counts.get(event.payload.path) ?? []), event]);
        }

        return [...counts.entries()]
          .filter(([, snapshots]) => snapshots.length >= 3)
          .map(([file, snapshots]) =>
            finding("lockfile_churn", "medium", `${file} changed ${snapshots.length} times`, snapshots.at(-1)?.ts ?? snapshots[0]!.ts)
          );
      }
    },
    {
      id: "dependency_added",
      severity: "medium",
      detect(events) {
        return dependencyChanges(events)
          .filter((event) => event.payload.change === "added")
          .map((event) => finding("dependency_added", "medium", `Added dependency ${event.payload.packageName}@${event.payload.afterVersion ?? "unknown"}`, event.ts));
      }
    },
    {
      id: "dependency_removed",
      severity: "medium",
      detect(events) {
        return dependencyChanges(events)
          .filter((event) => event.payload.change === "removed")
          .map((event) => finding("dependency_removed", "medium", `Removed dependency ${event.payload.packageName}`, event.ts));
      }
    },
    {
      id: "test_deleted",
      severity: "high",
      detect(events) {
        return fileSnapshots(events)
          .filter((event) => isTestFile(event.payload.path) && !event.payload.exists)
          .map((event) => finding("test_deleted", "high", `Deleted test file ${event.payload.path}`, event.ts));
      }
    },
    {
      id: "test_failure_loop",
      severity: "medium",
      detect(events) {
        const findings: RiskFinding[] = [];
        let failures: BlackboxEvent[] = [];

        for (const event of events) {
          if (event.type !== "TestRun") {
            continue;
          }

          failures = event.payload.status === "failed" ? [...failures, event] : [];
          if (failures.length === 3) {
            findings.push(finding("test_failure_loop", "medium", `Test command failed 3 times in a row: ${event.payload.command}`, event.ts));
          }
        }

        return findings;
      }
    },
    {
      id: "scope_creep",
      severity: "medium",
      detect(events) {
        const sessionStart = events.find((event): event is SessionStartEvent => event.type === "SessionStart");
        const cwd = sessionStart?.payload.cwd;
        return fileSnapshots(events)
          .filter((event) => isOutsideScope(event.payload.path, cwd))
          .map((event) => finding("scope_creep", "medium", `Edited outside working directory: ${event.payload.path}`, event.ts));
      }
    },
    {
      id: "destructive_command",
      severity: "high",
      detect(events) {
        return events
          .filter((event) => event.type === "CommandRun")
          .filter((event) => destructiveCommandPattern.test(`${event.payload.command} ${event.payload.args.join(" ")}`))
          .map((event) => finding("destructive_command", "high", `Destructive command: ${event.payload.command} ${event.payload.args.join(" ")}`, event.ts));
      }
    },
    {
      id: "license_change",
      severity: "medium",
      detect(events) {
        return fileSnapshots(events)
          .filter((event) => basename(event.payload.path).toLowerCase() === "license")
          .map((event) => finding("license_change", "medium", `License file modified: ${event.payload.path}`, event.ts));
      }
    },
    {
      id: "env_write",
      severity: "high",
      detect(events) {
        return fileSnapshots(events)
          .filter((event) => redactionEngine.isSecretPath(event.payload.path) && basename(event.payload.path).startsWith(".env"))
          .map((event) => finding("env_write", "high", `Environment file written: ${event.payload.path}`, event.ts));
      }
    },
    {
      id: "large_deletion",
      severity: "medium",
      detect(events) {
        return fileSnapshots(events)
          .filter((event) => removedLineCount(event.payload.diff) >= 100)
          .map((event) => finding("large_deletion", "medium", `Removed ${removedLineCount(event.payload.diff)} lines in ${event.payload.path}`, event.ts));
      }
    }
  ];
}

const destructiveCommandPattern = /\b(?:rm\s+-rf|DROP\s+TABLE|git\s+push\s+--force|git\s+push\s+-f|del\s+\/[sq]|Remove-Item\s+.*-Recurse)\b/i;

function fileSnapshots(events: BlackboxEvent[]): FileSnapshotEvent[] {
  return events.filter((event): event is FileSnapshotEvent => event.type === "FileSnapshot");
}

function dependencyChanges(events: BlackboxEvent[]): DependencyChangeEvent[] {
  return events.filter((event): event is DependencyChangeEvent => event.type === "DependencyChange");
}

function finding(rule: RiskRuleId, severity: RiskSeverity, evidence: string, timestamp: string): RiskFinding {
  return { rule, severity, evidence, timestamp };
}

function isLockfile(filePath: string): boolean {
  return ["package-lock.json", "yarn.lock"].includes(basename(filePath));
}

function isTestFile(filePath: string): boolean {
  return /(?:\.test\.|\.spec\.)/.test(filePath);
}

function isOutsideScope(filePath: string, cwd: string | undefined): boolean {
  if (filePath.startsWith("..")) {
    return true;
  }

  if (!cwd || !isAbsolutePath(filePath)) {
    return false;
  }

  const normalizedCwd = normalizePath(cwd).replace(/\/+$/, "");
  const normalizedFile = normalizePath(filePath);
  return normalizedFile !== normalizedCwd && !normalizedFile.startsWith(`${normalizedCwd}/`);
}

function removedLineCount(diff: string | null): number {
  return (diff ?? "")
    .split(/\r?\n/)
    .filter((line) => line.startsWith("-") && !line.startsWith("---")).length;
}

function compareFindings(a: RiskFinding, b: RiskFinding): number {
  const severityOrder: Record<RiskSeverity, number> = { high: 0, medium: 1, low: 2 };
  return severityOrder[a.severity] - severityOrder[b.severity] || a.timestamp.localeCompare(b.timestamp);
}

function basename(filePath: string): string {
  return normalizePath(filePath).split("/").at(-1) ?? filePath;
}

function normalizePath(filePath: string): string {
  return filePath.replaceAll("\\", "/");
}

function isAbsolutePath(filePath: string): boolean {
  return /^([A-Za-z]:)?\//.test(normalizePath(filePath));
}
