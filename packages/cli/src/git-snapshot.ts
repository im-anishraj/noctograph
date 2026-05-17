import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { simpleGit, type SimpleGit } from "simple-git";

export interface FileSnapshotData {
  path: string;
  exists: boolean;
  content: string | null;
  diff: string | null;
  hash: string | null;
}

export class GitSnapshotter {
  private readonly git: SimpleGit;
  private seen = new Map<string, string | null>();
  private readonly ignoredPathPrefixes: string[];
  private readonly maxFileBytes: number;

  constructor(
    private readonly cwd: string,
    options: { ignoredPathPrefixes?: string[] } = {}
  ) {
    this.git = simpleGit({ baseDir: cwd, binary: "git" });
    this.ignoredPathPrefixes = (options.ignoredPathPrefixes ?? []).map(normalizePath);
    this.maxFileBytes = 1_000_000;
  }

  async baselineHash(): Promise<string | null> {
    try {
      return (await this.git.revparse(["HEAD"])).trim();
    } catch {
      return null;
    }
  }

  async changedFiles(): Promise<string[]> {
    let status;
    try {
      status = await this.git.status();
    } catch {
      return [];
    }

    return [...new Set([...status.modified, ...status.created, ...status.deleted, ...status.not_added, ...status.renamed.map((item) => item.to)])]
      .filter((file) => !this.isIgnored(file))
      .sort();
  }

  async captureChangedFiles(): Promise<FileSnapshotData[]> {
    const files = await this.changedFiles();
    const snapshots: FileSnapshotData[] = [];

    for (const file of files) {
      const snapshot = await this.captureFile(file);
      if (this.seen.get(file) !== snapshot.hash) {
        this.seen.set(file, snapshot.hash);
        snapshots.push(snapshot);
      }
    }

    return snapshots;
  }

  private async captureFile(file: string): Promise<FileSnapshotData> {
    const absolute = path.join(this.cwd, file);
    let content: string | null = null;
    let exists = true;

    try {
      const fileStat = await stat(absolute);
      content = fileStat.size > this.maxFileBytes ? "[SKIPPED:file too large]" : await readFile(absolute, "utf8");
    } catch {
      exists = false;
    }

    const hash = content === null ? null : `sha256:${createHash("sha256").update(content).digest("hex")}`;
    const diff = await this.diffFor(file, exists);

    return { path: file, exists, content, diff, hash };
  }

  private async diffFor(file: string, exists: boolean): Promise<string | null> {
    try {
      const diff = exists ? await this.git.diff(["--", file]) : await this.git.diff(["--cached", "--", file]);
      return diff.trim().length > 0 ? diff : null;
    } catch {
      return null;
    }
  }

  private isIgnored(file: string): boolean {
    const normalized = normalizePath(file);
    return this.ignoredPathPrefixes.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`));
  }
}

function normalizePath(value: string): string {
  return value.replaceAll("\\", "/").replace(/\/+$/, "");
}
