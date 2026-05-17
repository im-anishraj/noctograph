export const installCommand = "npm install -g nactograph";

export const navItems = [
  { label: "Product", href: "#product" },
  { label: "Replay", href: "#replay" },
  { label: "Risk", href: "#risk" },
  { label: "Examples", href: "#examples" },
  { label: "Docs", href: "https://github.com/im-anishraj/noctograph#readme" },
  { label: "GitHub", href: "https://github.com/im-anishraj/noctograph" }
] as const;

export const proofStats = [
  { label: "Capture format", value: "JSONL", detail: "Validated event stream" },
  { label: "Runtime", value: "Local", detail: "No hosted recorder" },
  { label: "Risk rules", value: "11", detail: "Readable TypeScript checks" },
  { label: "Artifacts", value: "3", detail: "HTML, JSONL, PR comment" }
] as const;

export const recorderEvents = [
  { time: "00:00.000", type: "SessionStart", detail: "cwd, git head, command, redaction state", tone: "cyan" },
  { time: "00:07.184", type: "CommandRun", detail: "PTY command boundary and args", tone: "ink" },
  { time: "00:11.506", type: "CommandOutput", detail: "ANSI-stripped terminal stream", tone: "green" },
  { time: "00:19.402", type: "FileSnapshot", detail: "before, after, unified diff, hash", tone: "coral" },
  { time: "00:38.819", type: "TestRun", detail: "status, command, output summary", tone: "cyan" },
  { time: "00:44.710", type: "SessionEnd", detail: "duration, exit code, artifacts", tone: "ink" }
] as const;

export const terminalLines = [
  "$ nactograph run -- codex \"fix failing auth tests\"",
  "SessionStart      git: 3d1bd03  cwd: ./noctograph",
  "CommandRun        pnpm --filter nactograph-core test",
  "CommandOutput     184 clean lines captured",
  "FileSnapshot      src/auth.test.ts  +42 -8",
  "RedactionAudit    OPENAI_API_KEY masked before disk",
  "RiskScore         12/100  dependency_added",
  "SessionEnd        blackbox-report.html ready"
] as const;

export const replaySteps = [
  {
    step: "01",
    title: "Wrap the agent command",
    detail: "The agent still runs in a normal terminal, but every boundary is recorded in a PTY-backed session."
  },
  {
    step: "02",
    title: "Write evidence as it happens",
    detail: "Output, messages, diffs, tests, redactions, and dependency changes stream into JSONL in real time."
  },
  {
    step: "03",
    title: "Replay the exact moment",
    detail: "Reviewers can scrub the timeline and see the command, diff, risk finding, and artifact that came from it."
  }
] as const;

export const captureMatrix = [
  { name: "SessionStart", copy: "Command, cwd, git head, output directory, redaction state." },
  { name: "CommandRun", copy: "A precise boundary for every tool, shell, test, or agent command." },
  { name: "CommandOutput", copy: "Clean terminal text with ANSI removed and secrets masked." },
  { name: "FileSnapshot", copy: "Before/after contents, unified diff, hash, and existence state." },
  { name: "TestRun", copy: "Passed, failed, command, duration, and output summary." },
  { name: "DependencyChange", copy: "Package deltas surfaced separately from ordinary file churn." },
  { name: "RiskyAction", copy: "Rule, severity, timestamp, and human-readable evidence." },
  { name: "SessionEnd", copy: "Exit code, signal, duration, and final artifact inventory." }
] as const;

export const riskFindings = [
  { rule: "destructive_command", severity: "high", evidence: "rm -rf, force pushes, database drops, and similar commands." },
  { rule: "secret_access", severity: "medium", evidence: "Access to env files, private keys, credentials, or token-like output." },
  { rule: "test_deleted", severity: "high", evidence: "Deleted spec or test files that reduce review confidence." },
  { rule: "dependency_added", severity: "medium", evidence: "New package introduced during the agent run." },
  { rule: "large_deletion", severity: "medium", evidence: "Diff removes 100+ lines in one session." }
] as const;

export const artifactOutputs = [
  {
    name: "blackbox-report.html",
    role: "Reviewer artifact",
    copy: "A self-contained replay with filters, event cards, terminal output, diffs, and risk findings."
  },
  {
    name: "blackbox.jsonl",
    role: "Machine artifact",
    copy: "An append-only event stream for audits, tools, and future automation."
  },
  {
    name: "blackbox-pr-comment.md",
    role: "Pull request artifact",
    copy: "A concise summary with duration, commands, files changed, tests, and risk."
  }
] as const;

export const footerLinks = [
  { label: "GitHub", href: "https://github.com/im-anishraj/noctograph" },
  { label: "npm", href: "https://www.npmjs.com/package/nactograph" },
  { label: "Release v0.1.0", href: "https://github.com/im-anishraj/noctograph/releases/tag/v0.1.0" },
  { label: "README", href: "https://github.com/im-anishraj/noctograph#readme" }
] as const;
