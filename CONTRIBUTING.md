# Contributing to Nactograph

Thanks for helping improve Nactograph. This project is a local-first flight recorder for AI coding agents, so the best contributions make agent runs easier to capture, safer to share, or clearer to review.

## Quick Start

Use Node 24 or newer and pnpm:

```sh
pnpm install
pnpm verify
```

Useful focused commands:

```sh
pnpm --filter nactograph-core test
pnpm --filter nactograph test
pnpm --filter @nactograph/viewer test
pnpm --filter @nactograph/site build
```

## Repository Layout

```text
packages/core     event schemas, redaction, risk detection
packages/cli      PTY capture, git snapshots, JSONL writing, report generation
packages/viewer   React report viewer embedded into generated HTML
packages/site     Vercel landing page
```

## Finding Work

Good starter labels:

- `good first issue`: small, well-scoped tasks for first-time contributors.
- `beginner-friendly`: approachable with limited project context.
- `help wanted`: useful work where maintainer input is available.
- `mentorship available`: issues where maintainers can provide extra guidance.

Issue labels use a taxonomy:

- `type:*` for the kind of work.
- `area:*` for the subsystem.
- `priority:*` for urgency.
- `effort:*` for approximate size.
- `status:*` for workflow state.

## Branches and Commits

Create a focused branch for each logical change:

```sh
git switch -c fix/redaction-pattern-example
```

Use Conventional Commits:

```text
feat: add dependency risk fixture
fix: redact localhost URL tokens
docs: document custom redaction patterns
test: cover large deletion risk rule
chore: update release workflow
```

## Pull Requests

Before opening a pull request:

1. Run `pnpm verify`.
2. Add or update tests for behavior changes.
3. Update documentation when user-facing behavior changes.
4. Keep generated private session data out of commits.
5. Avoid unrelated refactors in the same PR.

Pull requests should explain:

- what changed
- why it changed
- how it was tested
- screenshots or report artifacts for UI/report work

## Safety Rules

- Never commit secrets, tokens, `.env` files, private keys, or private session captures.
- Prefer redacted fixtures over real terminal logs.
- For security-sensitive changes, include tests that show secrets are not stored.
- If you find a vulnerability, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.

## Release Flow

Releases are created from tags. The release workflow verifies the repo, builds binaries, publishes the npm package with trusted publishing, and uploads release artifacts.

## Maintainer Review Style

Nactograph values small, reviewable PRs. A good contribution usually has:

- one clear user-facing outcome
- focused tests
- minimal churn
- plain-language docs
