import { mkdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { EventWriter } from "./event-writer.js";

describe("EventWriter", () => {
  it("writes validated newline-delimited JSON events", async () => {
    const dir = path.join(os.tmpdir(), `blackbox-writer-${Date.now()}`);
    await mkdir(dir, { recursive: true });
    const writer = new EventWriter(path.join(dir, "events.jsonl"));

    await writer.open();
    await writer.write({
      id: "evt_1",
      ts: "2026-05-17T00:00:00.000Z",
      sessionId: "session_1",
      type: "CommandRun",
      payload: { command: "node", args: ["-v"], cwd: dir }
    });
    await writer.close();

    const lines = (await readFile(writer.path, "utf8")).trim().split("\n");
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0] ?? "{}")).toMatchObject({ type: "CommandRun" });
  });
});
