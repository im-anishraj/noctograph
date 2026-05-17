#!/usr/bin/env node

import { Command } from "commander";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runBlackbox } from "./run.js";

export const cliPackageName = "agent-blackbox";

export function buildProgram(): Command {
  const program = new Command();

  program.name("agent-blackbox").description("Local-first flight recorder for AI coding agents.").version("0.0.0");

  program
    .command("run")
    .description("Run an agent command and capture a shareable blackbox session.")
    .option("--output-dir <dir>", "directory for session artifacts", "./blackbox-sessions")
    .option("--redact", "redact sensitive values before storing", true)
    .option("--no-redact", "disable redaction")
    .allowUnknownOption(true)
    .allowExcessArguments(true)
    .argument("[command...]", "command to run after --")
    .action(async (command: string[], options: { outputDir: string; redact: boolean }) => {
      const result = await runBlackbox({
        command,
        cwd: process.cwd(),
        outputDir: options.outputDir,
        redact: options.redact
      });

      process.exit(result.exitCode ?? (result.signal ? 1 : 0));
    });

  return program;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await buildProgram().parseAsync(process.argv);
}
