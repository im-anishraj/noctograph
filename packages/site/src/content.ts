export const metrics = [
  { label: "Artifacts", value: "3", detail: "HTML, JSONL, PR comment" },
  { label: "Runtime", value: "Local", detail: "No hosted recorder" },
  { label: "Risk rules", value: "11", detail: "Typed detector coverage" },
  { label: "Install", value: "npm", detail: "nactograph@0.1.0" }
] as const;

export const captureEvents = [
  "SessionStart",
  "CommandRun",
  "CommandOutput",
  "FileSnapshot",
  "TestRun",
  "DependencyChange",
  "RiskyAction",
  "SessionEnd"
] as const;

export const liveCaptureLines = [
  { label: "00:00.000", value: "SessionStart", tone: "teal" },
  { label: "00:07.184", value: "CommandRun", tone: "ink" },
  { label: "00:11.506", value: "CommandOutput", tone: "lime" },
  { label: "00:19.402", value: "FileSnapshot", tone: "coral" },
  { label: "00:38.819", value: "TestRun", tone: "teal" },
  { label: "00:44.710", value: "SessionEnd", tone: "ink" }
] as const;

export const riskRules = [
  "secret_access",
  "dependency_added",
  "destructive_command",
  "large_deletion",
  "test_failure_loop",
  "env_write"
] as const;

export const artifacts = [
  {
    name: "blackbox-report.html",
    description: "A self-contained replay with filters, event cards, diffs, terminal output, and risk findings."
  },
  {
    name: "blackbox.jsonl",
    description: "A validated append-only event stream for audits, tools, and future automation."
  },
  {
    name: "blackbox-pr-comment.md",
    description: "A paste-ready summary for reviewers who need duration, files changed, tests, and risk."
  }
] as const;

export const workflowSteps = [
  { title: "Run agent", text: "Wrap Codex, Claude, shell scripts, or any command in a PTY." },
  { title: "Capture stream", text: "Keep stdout/stderr visible while writing clean event logs." },
  { title: "Snapshot git", text: "Poll diffs and file snapshots without touching your commits." },
  { title: "Redact early", text: "Strip secrets before they are persisted into reports." },
  { title: "Score risk", text: "Flag destructive commands, env writes, churn, and deleted tests." },
  { title: "Share proof", text: "Attach HTML, JSONL, or a PR comment to the review." }
] as const;

export const terminalLines = [
  "$ nactograph run -- codex \"fix failing auth tests\"",
  "SessionStart      git: 367ec65",
  "CommandRun        codex fix failing auth tests",
  "CommandOutput     184 lines captured",
  "FileSnapshot      src/auth.test.ts  +42 -8",
  "RedactionAudit    2 values masked",
  "TestRun           18 passed",
  "SessionEnd        blackbox-report.html ready"
] as const;
