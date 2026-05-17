import { describe, expect, it } from "vitest";
import { quoteShellArg, resolveExecutable, shellArgs } from "./pty-runner.js";

describe("PTY command helpers", () => {
  it("quotes shell arguments with spaces", () => {
    expect(quoteShellArg("hello world")).toContain("hello world");
    expect(quoteShellArg("safe-token_1")).toBe("safe-token_1");
  });

  it("wraps commands for the platform shell", () => {
    const args = shellArgs(["node", "-e", "console.log('ok')"]);
    expect(args.join(" ")).toContain("node");
    expect(args.join(" ")).toContain("console.log");
  });

  it("resolves executables from PATH", () => {
    expect(resolveExecutable("tool", { PATH: pathLike(["/tmp/bin"]), PATHEXT: ".EXE" })).toBe("tool");
  });
});

function pathLike(entries: string[]): string {
  return entries.join(process.platform === "win32" ? ";" : ":");
}
