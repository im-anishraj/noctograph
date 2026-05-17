import os from "node:os";
import { existsSync } from "node:fs";
import path from "node:path";
import * as pty from "node-pty";

export interface PtyRunOptions {
  cwd: string;
  env?: NodeJS.ProcessEnv;
  onData(data: string): void | Promise<void>;
  onExit(exit: { exitCode: number; signal?: number }): void | Promise<void>;
}

export interface PtyHandle {
  write(data: string): void;
  resize(cols: number, rows: number): void;
  kill(signal?: string): void;
}

export function defaultShell(): string {
  if (process.platform === "win32") {
    return process.env.ComSpec ?? "cmd.exe";
  }

  return process.env.SHELL ?? "sh";
}

export function shellArgs(command: string[]): string[] {
  const joined = command.map(quoteShellArg).join(" ");
  if (process.platform === "win32") {
    return ["/d", "/c", joined];
  }

  return ["-lc", joined];
}

export function quoteShellArg(value: string): string {
  if (/^[A-Za-z0-9_./:=@+-]+$/.test(value)) {
    return value;
  }

  if (process.platform === "win32") {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return `'${value.replaceAll("'", "'\\''")}'`;
}

export function createPty(command: string[], options: PtyRunOptions): PtyHandle {
  const [file, ...args] = command;
  if (!file) {
    throw new Error("Cannot spawn an empty PTY command.");
  }

  const subprocess = pty.spawn(resolveExecutable(file, options.env), args, {
    name: "xterm-256color",
    cols: process.stdout.columns || 120,
    rows: process.stdout.rows || 30,
    cwd: path.resolve(options.cwd),
    env: { ...process.env, ...options.env }
  });

  subprocess.onData((data) => {
    void options.onData(data);
  });

  subprocess.onExit((exit) => {
    void options.onExit(exit);
  });

  return {
    write(data: string) {
      subprocess.write(data);
    },
    resize(cols: number, rows: number) {
      subprocess.resize(cols, rows);
    },
    kill(signal?: string) {
      subprocess.kill(signal);
    }
  };
}

export function currentPlatformLineEnding(): string {
  return os.EOL;
}

export function resolveExecutable(command: string, env: NodeJS.ProcessEnv = process.env): string {
  if (path.isAbsolute(command) || command.includes("/") || command.includes("\\")) {
    return command;
  }

  const pathEntries = (env.PATH ?? env.Path ?? "").split(path.delimiter).filter(Boolean);
  const extensions = process.platform === "win32" ? (env.PATHEXT ?? ".COM;.EXE;.BAT;.CMD").split(";") : [""];
  const candidates = process.platform === "win32" && path.extname(command) ? [command] : extensions.map((extension) => `${command}${extension.toLowerCase()}`);

  for (const entry of pathEntries) {
    for (const candidate of candidates) {
      const resolved = path.join(entry, candidate);
      if (existsSync(resolved)) {
        return resolved;
      }
    }
  }

  return command;
}
