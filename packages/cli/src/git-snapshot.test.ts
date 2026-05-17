import { mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { simpleGit } from "simple-git";
import { describe, expect, it } from "vitest";
import { GitSnapshotter } from "./git-snapshot.js";

describe("GitSnapshotter", () => {
  it("captures changed file content and diff", async () => {
    const dir = path.join(os.tmpdir(), `blackbox-git-${Date.now()}`);
    await mkdir(dir, { recursive: true });
    const git = simpleGit({ baseDir: dir });
    await git.init();
    await git.addConfig("user.email", "test@example.com");
    await git.addConfig("user.name", "Test User");
    await writeFile(path.join(dir, "file.txt"), "before\n");
    await git.add("file.txt");
    await git.commit("initial");

    await writeFile(path.join(dir, "file.txt"), "after\n");
    const snapshotter = new GitSnapshotter(dir);
    const snapshots = await snapshotter.captureChangedFiles();

    expect(snapshots).toHaveLength(1);
    expect(snapshots[0]).toMatchObject({
      path: "file.txt",
      exists: true,
      content: "after\n"
    });
    expect(snapshots[0]?.diff).toContain("-before");
    expect(snapshots[0]?.diff).toContain("+after");
  });

  it("ignores configured output paths", async () => {
    const dir = path.join(os.tmpdir(), `blackbox-git-ignore-${Date.now()}`);
    await mkdir(path.join(dir, "blackbox-sessions", "session_1"), { recursive: true });
    const git = simpleGit({ baseDir: dir });
    await git.init();
    await git.addConfig("user.email", "test@example.com");
    await git.addConfig("user.name", "Test User");
    await writeFile(path.join(dir, "file.txt"), "before\n");
    await git.add("file.txt");
    await git.commit("initial");

    await writeFile(path.join(dir, "file.txt"), "after\n");
    await writeFile(path.join(dir, "blackbox-sessions", "session_1", "blackbox.jsonl"), "{}\n");
    const snapshotter = new GitSnapshotter(dir, { ignoredPathPrefixes: ["blackbox-sessions"] });

    expect((await snapshotter.captureChangedFiles()).map((snapshot) => snapshot.path)).toEqual(["file.txt"]);
  });

  it("skips very large file contents", async () => {
    const dir = path.join(os.tmpdir(), `blackbox-git-large-${Date.now()}`);
    await mkdir(dir, { recursive: true });
    const git = simpleGit({ baseDir: dir });
    await git.init();
    await writeFile(path.join(dir, "large.txt"), "x".repeat(1_000_001));

    const snapshots = await new GitSnapshotter(dir).captureChangedFiles();

    expect(snapshots[0]).toMatchObject({ path: "large.txt", content: "[SKIPPED:file too large]" });
  });
});
