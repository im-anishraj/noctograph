import { mkdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { simpleGit } from "simple-git";
import { describe, expect, it } from "vitest";
import { runBlackbox } from "./run.js";

describe("runBlackbox redaction", () => {
  it("redacts command output before writing JSONL", async () => {
    const dir = path.join(os.tmpdir(), `blackbox-run-${Date.now()}`);
    await mkdir(dir, { recursive: true });
    await simpleGit({ baseDir: dir }).init();

    const result = await runBlackbox({
      command: ["node", "-e", "console.log('OPENAI_API_KEY=sk-secret')"],
      cwd: dir,
      outputDir: "blackbox-sessions",
      redact: true,
      pollIntervalMs: 10_000
    });

    const jsonl = await readFile(result.jsonlPath, "utf8");
    expect(jsonl).not.toContain("sk-secret");
    expect(jsonl).toContain("OPENAI_API_KEY=[REDACTED:openai_api_key]");
    expect(jsonl).toContain("Redaction audit:");
  });
});
