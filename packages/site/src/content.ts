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
