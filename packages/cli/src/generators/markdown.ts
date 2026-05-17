import type { SessionReportData } from "./session.js";

export function generateMarkdownReport(data: SessionReportData): string {
  const duration = `${(data.metrics.durationMs / 1000).toFixed(1)}s`;
  const riskRows =
    data.risk.findings.length === 0
      ? "_No risk findings._"
      : ["| Rule | Severity | Evidence |", "|---|---|---|", ...data.risk.findings.map((finding) => `| ${finding.rule} | ${finding.severity} | ${escapeCell(finding.evidence)} |`)].join("\n");
  const fileRows =
    data.files.length === 0
      ? "_No files changed._"
      : data.files.map((file) => `- \`${file.path}\` (+${file.added}/-${file.removed})`).join("\n");

  return `## Agent Blackbox Session Report

| Metric | Value |
|---|---|
| Duration | ${duration} |
| Files changed | ${data.metrics.filesChanged} |
| Commands run | ${data.metrics.commandsRun} |
| Tests run | ${data.metrics.testsRun} (${data.metrics.testsPassed} passed, ${data.metrics.testsFailed} failed) |
| Risk score | ${data.risk.score}/100 |

### Risk findings

${riskRows}

### Files changed

${fileRows}

### Full timeline

${data.events.map((event) => `- ${event.ts} \`${event.type}\``).join("\n")}
`;
}

function escapeCell(value: string): string {
  return value.replaceAll("|", "\\|").replace(/\r?\n/g, " ");
}
