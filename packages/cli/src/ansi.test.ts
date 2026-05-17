import { describe, expect, it } from "vitest";
import { stripAnsi } from "./ansi.js";

describe("stripAnsi", () => {
  it("removes terminal color codes", () => {
    expect(stripAnsi("\u001b[32mok\u001b[0m")).toBe("ok");
  });

  it("removes terminal title escape sequences", () => {
    expect(stripAnsi("ok\r\n\u001b]0;C:\\Program Files\\nodejs\\node.exe\u0007")).toBe("ok\r\n");
  });
});
