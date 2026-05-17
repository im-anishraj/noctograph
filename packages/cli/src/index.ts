#!/usr/bin/env node

import { Command } from "commander";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parsePatternFile } from "nactograph-core";
import { runBlackbox } from "./run.js";

export const cliPackageName = "nactograph";

export function buildProgram(): Command {
  const program = new Command();

  program.name("nactograph").description("Local-first flight recorder for AI coding agents.").version("0.0.0");

  program
    .command("run")
    .description("Run an agent command and capture a shareable blackbox session.")
    .option("--output-dir <dir>", "directory for session artifacts", "./blackbox-sessions")
    .option("--redact", "redact sensitive values before storing", true)
    .option("--no-redact", "disable redaction")
    .option("--redact-patterns <path>", "path to newline-delimited custom redaction patterns")
    .allowUnknownOption(true)
    .allowExcessArguments(true)
    .argument("[command...]", "command to run after --")
    .action(async (command: string[], options: { outputDir: string; redact: boolean; redactPatterns?: string }) => {
      const customPatterns =
        options.redactPatterns === undefined ? undefined : parsePatternFile(await readFile(path.resolve(options.redactPatterns), "utf8"));
      const result = await runBlackbox({
        command,
        cwd: process.cwd(),
        outputDir: options.outputDir,
        redact: options.redact,
        redactPatterns: customPatterns
      });

      process.exit(result.exitCode ?? (result.signal ? 1 : 0));
    });

  return program;
}

export async function runCli(argv = process.argv): Promise<void> {
  await buildProgram().parseAsync(argv);
}

function reportCliError(error: unknown): void {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

if (typeof import.meta.url === "string" && process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  void runCli().catch(reportCliError);
}
