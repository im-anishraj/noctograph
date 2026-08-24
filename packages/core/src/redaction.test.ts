import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { parsePatternFile, RedactionEngine } from "./redaction.js";

describe("RedactionEngine", () => {
  it("redacts default secret assignments and records audit counts without values", () => {
    const engine = new RedactionEngine();
    const result = engine.redactText("OPENAI_API_KEY=sk-test AWS_SECRET_ACCESS_KEY=secret");

    expect(result.text).toBe("OPENAI_API_KEY=[REDACTED:openai_api_key] AWS_SECRET_ACCESS_KEY=[REDACTED:aws_secret_access_key]");
    expect(JSON.stringify(result.audit)).not.toContain("sk-test");
    expect(engine.auditLog()).toHaveLength(2);
  });

  it("redacts Azure AD OAuth access tokens (JWT format)", () => {
    const engine = new RedactionEngine();
    const token =
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL21hbmFnZW1lbnQuYXp1cmUuY29tLyJ9.c2lnbmF0dXJlLXBhcnQtZXhhbXBsZQ";
    const result = engine.redactText(`Authorization: Bearer ${token}`);

    expect(result.text).toBe("Authorization: Bearer [REDACTED:azure_access_token]");
    expect(JSON.stringify(result.audit)).not.toContain(token);
  });

  it("redacts secret-like file contents by path", () => {
    const engine = new RedactionEngine();
    const result = engine.redactFileContent(".env.local", "OPENAI_API_KEY=sk-test");

    expect(result.text).toBe("[REDACTED:secret_file]");
    expect(result.audit).toMatchObject([{ ruleId: "secret_file", count: 1 }]);
  });

  it("supports custom patterns from pattern files", () => {
    const engine = new RedactionEngine({ customPatterns: parsePatternFile("# comment\n/internal-only-[0-9]+/") });

    expect(engine.redactText("token internal-only-123").text).toBe("token [REDACTED:custom]");
  });

  it("redacts generic long base64-like tokens for arbitrary generated secrets", () => {
    fc.assert(
      fc.property(base64LikeSecret(), (secret) => {
        const engine = new RedactionEngine();
        const result = engine.redactText(`value=${secret}`);
        expect(result.text).not.toContain(secret);
      })
    );
  });

  it("never includes redacted values in audit logs", () => {
    fc.assert(
      fc.property(base64LikeSecret(), (secret) => {
        const engine = new RedactionEngine();
        engine.redactText(secret);
        expect(JSON.stringify(engine.auditLog())).not.toContain(secret);
      })
    );
  });
});

function base64LikeSecret() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
  return fc.array(fc.constantFrom(...chars), { minLength: 40, maxLength: 80 }).map((parts) => parts.join(""));
}
