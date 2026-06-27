import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const rootReadme = new URL("../../../README.md", import.meta.url);
const cliReadme = new URL("../README.md", import.meta.url);

describe("CLI documentation examples", () => {
  it("documents PowerShell quick-start commands in the root README", async () => {
    const readme = await readFile(rootReadme, "utf8");

    expect(readme).toContain("```powershell");
    expect(readme).toContain('nactograph run -- codex "fix failing auth tests"');
    expect(readme).toContain("Invoke-Item");
    expect(readme).toContain("Get-Content");
  });

  it("documents PowerShell quick-start commands in the CLI README", async () => {
    const readme = await readFile(cliReadme, "utf8");

    expect(readme).toContain("```powershell");
    expect(readme).toContain('nactograph run -- codex "fix failing auth tests"');
    expect(readme).toContain("Invoke-Item");
    expect(readme).toContain("Get-Content");
  });
});
