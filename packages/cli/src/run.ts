import { RedactionEngine, type BlackboxEvent, type BlackboxEventType } from "@agent-blackbox/core";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { stripAnsi } from "./ansi.js";
import { EventWriter } from "./event-writer.js";
import { GitSnapshotter } from "./git-snapshot.js";
import { generateReportArtifacts } from "./generators/report-artifacts.js";
import { createPty, type PtyHandle } from "./pty-runner.js";

export interface RunOptions {
  command: string[];
  cwd: string;
  outputDir: string;
  redact: boolean;
  redactPatterns?: string[];
  pollIntervalMs?: number;
}

export interface RunResult {
  exitCode: number | null;
  signal: string | null;
  sessionId: string;
  jsonlPath: string;
  htmlPath: string;
  markdownPath: string;
}

export async function runBlackbox(options: RunOptions): Promise<RunResult> {
  if (options.command.length === 0) {
    throw new Error("No command provided. Usage: agent-blackbox run -- <command>");
  }

  const startedAt = Date.now();
  const sessionId = `session_${randomUUID()}`;
  const sessionDir = path.resolve(options.cwd, options.outputDir, sessionId);
  await mkdir(sessionDir, { recursive: true });

  const writer = new EventWriter(path.join(sessionDir, "blackbox.jsonl"));
  await writer.open();

  const ignoredOutputRoot = path.relative(options.cwd, path.resolve(options.cwd, options.outputDir));
  const snapshotter = new GitSnapshotter(options.cwd, { ignoredPathPrefixes: [ignoredOutputRoot] });
  const gitHead = await snapshotter.baselineHash();
  const redactionEngine = options.redact ? new RedactionEngine({ customPatterns: options.redactPatterns }) : null;
  const redactText = (value: string) => redactionEngine?.redactText(value).text ?? value;
  const redactFileContent = (filePath: string, value: string | null) => {
    if (value === null) {
      return null;
    }

    return redactionEngine?.redactFileContent(filePath, value).text ?? value;
  };

  let ptyHandle: PtyHandle | null = null;
  let closed = false;
  let exitCode: number | null = null;
  let signal: string | null = null;

  const writeEvent = async (type: BlackboxEventType, payload: BlackboxEvent["payload"]) => {
    await writer.write({
      id: `evt_${randomUUID()}`,
      ts: new Date().toISOString(),
      sessionId,
      type,
      payload
    } as BlackboxEvent);
  };

  const flushSnapshots = async () => {
    const snapshots = await snapshotter.captureChangedFiles();
    for (const snapshot of snapshots) {
      await writeEvent("FileSnapshot", {
        path: snapshot.path,
        phase: "after",
        exists: snapshot.exists,
        content: redactFileContent(snapshot.path, snapshot.content),
        diff: redactFileContent(snapshot.path, snapshot.diff),
        hash: snapshot.hash
      });
    }
  };

  const finish = async () => {
    if (closed) {
      return;
    }

    closed = true;
    clearInterval(pollTimer);
    process.stdin.off("data", onStdin);
    process.stdout.off("resize", onResize);
    process.off("SIGINT", onSignal);
    process.off("SIGTERM", onSignal);

    await flushSnapshots();
    if (redactionEngine) {
      await writeEvent("AgentMessage", {
        role: "system",
        text: `Redaction audit: ${JSON.stringify(redactionEngine.auditLog())}`
      });
    }

    await writeEvent("SessionEnd", {
      exitCode,
      signal,
      durationMs: Date.now() - startedAt
    });
    await writer.close();
  };

  const onStdin = (data: Buffer) => {
    ptyHandle?.write(data.toString());
  };

  const onResize = () => {
    ptyHandle?.resize(process.stdout.columns || 120, process.stdout.rows || 30);
  };

  const onSignal = (receivedSignal: NodeJS.Signals) => {
    signal = receivedSignal;
    ptyHandle?.kill(receivedSignal);
  };

  await writeEvent("SessionStart", {
    command: options.command.map(redactText),
    cwd: options.cwd,
    gitHead,
    outputDir: sessionDir,
    redact: options.redact
  });

  await writeEvent("CommandRun", {
    command: redactText(options.command[0] ?? ""),
    args: options.command.slice(1).map(redactText),
    cwd: options.cwd
  });

  const pollTimer = setInterval(() => {
    void flushSnapshots();
  }, options.pollIntervalMs ?? 2000);

  process.stdin.on("data", onStdin);
  process.stdout.on("resize", onResize);
  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);

  const result = await new Promise<RunResult>((resolve) => {
    ptyHandle = createPty(options.command, {
      cwd: options.cwd,
      onData: async (data) => {
        process.stdout.write(data);
        await writeEvent("CommandOutput", {
          stream: "stdout",
          text: redactText(stripAnsi(data)),
          raw: redactText(data),
          truncated: false
        });
      },
      onExit: async (exit) => {
        exitCode = exit.exitCode;
        signal ??= exit.signal === undefined ? null : String(exit.signal);
        await finish();
        const artifacts = await generateReportArtifacts(writer.path);
        resolve({ exitCode, signal, sessionId, jsonlPath: writer.path, ...artifacts });
      }
    });
  });

  return result;
}
