# Security Policy

Nactograph records terminal output, file diffs, and local session artifacts. Security and redaction behavior are core project concerns.

## Supported Versions

| Version | Supported |
|---|---|
| `0.1.x` | Yes |

## Reporting a Vulnerability

Please do not open a public issue for a vulnerability.

Report security issues privately by emailing the maintainer or by using GitHub's private vulnerability reporting if it is enabled for this repository.

Include:

- affected version or commit
- operating system and Node version
- reproduction steps
- whether secret data may be exposed
- suggested fix, if known

## Security Expectations

Security fixes should prioritize:

- redacting sensitive values before disk writes
- preventing secret leakage in reports and tests
- avoiding command execution surprises
- keeping generated artifacts local unless the user explicitly shares them

## Out of Scope

Nactograph cannot guarantee that an agent command is safe to run. It records and reports what happened; it is not a sandbox.
