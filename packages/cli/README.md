# Nactograph

**Every AI agent run, replayed like evidence.**

Nactograph is a local-first flight recorder for AI coding agents. It wraps an agent command, records terminal output and git diffs, redacts sensitive values, scores risky actions, and writes shareable review artifacts.

```sh
npm install -g nactograph
nactograph run -- codex "fix failing auth tests"
```

Outputs:

```text
blackbox-report.html
blackbox.jsonl
blackbox-pr-comment.md
```

## Why use it?

- Replay what the agent actually did, not just the final diff.
- Catch risky behavior such as secret access, test deletion, large removals, dependency churn, and destructive commands.
- Share a static HTML report or Markdown PR summary without running a hosted service.
- Keep session data local by default.

## CLI

```sh
nactograph run [options] -- <command...>
```

| Flag | Default | Description |
|---|---:|---|
| `--output-dir <dir>` | `./blackbox-sessions` | Directory for session folders and report artifacts. |
| `--redact` | on | Redact secrets before anything is stored. |
| `--no-redact` | off | Disable redaction for private local debugging. |
| `--redact-patterns <path>` | none | Newline-delimited custom redaction patterns. Supports globs and `/regex/flags`. |

Website: https://nactograph.vercel.app

Full documentation: https://github.com/im-anishraj/noctograph#readme
