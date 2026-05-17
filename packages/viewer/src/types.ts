import type { BlackboxEvent, RiskFinding } from "agent-blackbox-core";

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

declare global {
  interface Window {
    __BLACKBOX_SESSION__?: SessionReportData | null;
  }
}
