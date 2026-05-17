export interface RedactionRule {
  id: string;
  description: string;
  pattern: RegExp;
  replacement?: string;
}

export interface RedactionAuditEntry {
  ruleId: string;
  description: string;
  count: number;
}

export interface RedactionResult {
  text: string;
  audit: RedactionAuditEntry[];
}

export interface RedactionEngineOptions {
  customPatterns?: string[];
}

const secretFilePatterns = [".env", ".env.*", "*.pem", "*.key", "id_rsa", "secrets.*", "credentials.*"];

export class RedactionEngine {
  private readonly rules: RedactionRule[];
  private readonly secretPathPatterns: RegExp[];
  private readonly audit = new Map<string, RedactionAuditEntry>();

  constructor(options: RedactionEngineOptions = {}) {
    const customRules = (options.customPatterns ?? []).map((pattern, index) => ({
      id: `custom_${index + 1}`,
      description: `Custom redaction pattern ${index + 1}`,
      pattern: parseCustomPattern(pattern),
      replacement: "[REDACTED:custom]"
    }));

    this.rules = [...defaultRedactionRules, ...customRules];
    this.secretPathPatterns = secretFilePatterns.map(globToRegExp);
  }

  redactText(input: string): RedactionResult {
    let text = input;
    const before = this.snapshotAudit();

    for (const rule of this.rules) {
      let count = 0;
      rule.pattern.lastIndex = 0;
      text = text.replace(rule.pattern, () => {
        count += 1;
        return rule.replacement ?? `[REDACTED:${rule.id}]`;
      });
      rule.pattern.lastIndex = 0;

      if (count > 0) {
        this.record(rule.id, rule.description, count);
      }
    }

    return { text, audit: diffAudit(before, this.snapshotAudit()) };
  }

  redactFileContent(filePath: string, content: string | null): RedactionResult {
    if (content === null) {
      return { text: "", audit: [] };
    }

    if (this.isSecretPath(filePath)) {
      const ruleId = "secret_file";
      const before = this.snapshotAudit();
      this.record(ruleId, "Secret-like file content redacted by path", 1);
      return { text: "[REDACTED:secret_file]", audit: diffAudit(before, this.snapshotAudit()) };
    }

    return this.redactText(content);
  }

  isSecretPath(filePath: string): boolean {
    const normalized = normalizePath(filePath);
    const basename = normalized.split("/").at(-1) ?? normalized;
    return this.secretPathPatterns.some((pattern) => pattern.test(normalized) || pattern.test(basename));
  }

  auditLog(): RedactionAuditEntry[] {
    return this.snapshotAudit();
  }

  private record(ruleId: string, description: string, count: number): void {
    const existing = this.audit.get(ruleId);
    if (existing) {
      existing.count += count;
      return;
    }

    this.audit.set(ruleId, { ruleId, description, count });
  }

  private snapshotAudit(): RedactionAuditEntry[] {
    return [...this.audit.values()].map((entry) => ({ ...entry }));
  }
}

export const defaultRedactionRules: RedactionRule[] = [
  {
    id: "aws_access_key_id",
    description: "AWS access key id assignment",
    pattern: /AWS_ACCESS_KEY_ID\s*=\s*[^\s"'`]+/g,
    replacement: "AWS_ACCESS_KEY_ID=[REDACTED:aws_access_key_id]"
  },
  {
    id: "aws_secret_access_key",
    description: "AWS secret access key assignment",
    pattern: /AWS_SECRET_ACCESS_KEY\s*=\s*[^\s"'`]+/g,
    replacement: "AWS_SECRET_ACCESS_KEY=[REDACTED:aws_secret_access_key]"
  },
  {
    id: "github_token",
    description: "GitHub token assignment",
    pattern: /GITHUB_TOKEN\s*=\s*[^\s"'`]+/g,
    replacement: "GITHUB_TOKEN=[REDACTED:github_token]"
  },
  {
    id: "openai_api_key",
    description: "OpenAI API key assignment",
    pattern: /OPENAI_API_KEY\s*=\s*[^\s"'`]+/g,
    replacement: "OPENAI_API_KEY=[REDACTED:openai_api_key]"
  },
  {
    id: "long_base64",
    description: "Generic long base64-like token",
    pattern: /\b[A-Za-z0-9+/]{40,}={0,2}\b/g,
    replacement: "[REDACTED:long_base64]"
  },
  {
    id: "private_ip",
    description: "Private IP address",
    pattern: /\b(?:10(?:\.\d{1,3}){3}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}|192\.168(?:\.\d{1,3}){2})\b/g,
    replacement: "[REDACTED:private_ip]"
  },
  {
    id: "localhost_url_token",
    description: "Localhost URL token query parameter",
    pattern: /\bhttps?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/[^\s"'`?]*(\?(?:[^\s"'`#]*&)?(?:token|key|secret)=[^\s"'`&#]+)/gi,
    replacement: "[REDACTED:localhost_url_token]"
  }
];

export function parsePatternFile(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
}

function parseCustomPattern(pattern: string): RegExp {
  const regexLiteral = pattern.match(/^\/(.+)\/([dgimsuvy]*)$/);
  if (regexLiteral) {
    return new RegExp(regexLiteral[1] ?? "", regexLiteral[2]?.includes("g") ? regexLiteral[2] : `${regexLiteral[2] ?? ""}g`);
  }

  return globToRegExp(pattern);
}

function globToRegExp(glob: string): RegExp {
  const escaped = glob
    .replaceAll("\\", "/")
    .split("*")
    .map(escapeRegExp)
    .join("[^/]*");
  return new RegExp(`(^|/)${escaped}$`, "i");
}

function escapeRegExp(input: string): string {
  return input.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

function normalizePath(filePath: string): string {
  return filePath.replaceAll("\\", "/");
}

function diffAudit(before: RedactionAuditEntry[], after: RedactionAuditEntry[]): RedactionAuditEntry[] {
  const previous = new Map(before.map((entry) => [entry.ruleId, entry.count]));
  return after
    .map((entry) => ({ ...entry, count: entry.count - (previous.get(entry.ruleId) ?? 0) }))
    .filter((entry) => entry.count > 0);
}
