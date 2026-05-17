import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const isoTimestampSchema = z.string().datetime({ offset: true });

const eventBaseSchema = z.object({
  id: z.string().min(1),
  ts: isoTimestampSchema,
  sessionId: z.string().min(1)
});

export const sessionStartPayloadSchema = z.object({
  command: z.array(z.string()).min(1),
  cwd: z.string().min(1),
  gitHead: z.string().nullable(),
  outputDir: z.string().min(1),
  redact: z.boolean()
});

export const sessionEndPayloadSchema = z.object({
  exitCode: z.number().int().nullable(),
  signal: z.string().nullable(),
  durationMs: z.number().int().nonnegative()
});

export const commandRunPayloadSchema = z.object({
  command: z.string().min(1),
  args: z.array(z.string()),
  cwd: z.string().min(1)
});

export const commandOutputPayloadSchema = z.object({
  stream: z.enum(["stdout", "stderr"]),
  text: z.string(),
  raw: z.string().optional(),
  truncated: z.boolean().default(false)
});

export const fileSnapshotPayloadSchema = z.object({
  path: z.string().min(1),
  phase: z.enum(["before", "after"]),
  exists: z.boolean(),
  content: z.string().nullable(),
  diff: z.string().nullable(),
  hash: z.string().nullable()
});

export const testRunPayloadSchema = z.object({
  command: z.string().min(1),
  status: z.enum(["passed", "failed", "skipped"]),
  exitCode: z.number().int().nullable(),
  durationMs: z.number().int().nonnegative(),
  output: z.string()
});

export const dependencyChangePayloadSchema = z.object({
  manifestPath: z.string().min(1),
  packageName: z.string().min(1),
  change: z.enum(["added", "removed", "updated"]),
  beforeVersion: z.string().nullable(),
  afterVersion: z.string().nullable()
});

export const riskyActionPayloadSchema = z.object({
  rule: z.string().min(1),
  severity: z.enum(["low", "medium", "high"]),
  description: z.string().min(1),
  evidence: z.string().min(1)
});

export const agentMessagePayloadSchema = z.object({
  role: z.enum(["agent", "user", "system", "tool"]),
  text: z.string()
});

export const errorEventPayloadSchema = z.object({
  name: z.string().min(1),
  message: z.string().min(1),
  stack: z.string().optional()
});

export const sessionStartEventSchema = eventBaseSchema.extend({
  type: z.literal("SessionStart"),
  payload: sessionStartPayloadSchema
});

export const sessionEndEventSchema = eventBaseSchema.extend({
  type: z.literal("SessionEnd"),
  payload: sessionEndPayloadSchema
});

export const commandRunEventSchema = eventBaseSchema.extend({
  type: z.literal("CommandRun"),
  payload: commandRunPayloadSchema
});

export const commandOutputEventSchema = eventBaseSchema.extend({
  type: z.literal("CommandOutput"),
  payload: commandOutputPayloadSchema
});

export const fileSnapshotEventSchema = eventBaseSchema.extend({
  type: z.literal("FileSnapshot"),
  payload: fileSnapshotPayloadSchema
});

export const testRunEventSchema = eventBaseSchema.extend({
  type: z.literal("TestRun"),
  payload: testRunPayloadSchema
});

export const dependencyChangeEventSchema = eventBaseSchema.extend({
  type: z.literal("DependencyChange"),
  payload: dependencyChangePayloadSchema
});

export const riskyActionEventSchema = eventBaseSchema.extend({
  type: z.literal("RiskyAction"),
  payload: riskyActionPayloadSchema
});

export const agentMessageEventSchema = eventBaseSchema.extend({
  type: z.literal("AgentMessage"),
  payload: agentMessagePayloadSchema
});

export const errorEventSchema = eventBaseSchema.extend({
  type: z.literal("ErrorEvent"),
  payload: errorEventPayloadSchema
});

export const blackboxEventSchema = z.discriminatedUnion("type", [
  sessionStartEventSchema,
  sessionEndEventSchema,
  commandRunEventSchema,
  commandOutputEventSchema,
  fileSnapshotEventSchema,
  testRunEventSchema,
  dependencyChangeEventSchema,
  riskyActionEventSchema,
  agentMessageEventSchema,
  errorEventSchema
]);

export const blackboxEventsSchema = z.array(blackboxEventSchema);

export type SessionStartEvent = z.infer<typeof sessionStartEventSchema>;
export type SessionEndEvent = z.infer<typeof sessionEndEventSchema>;
export type CommandRunEvent = z.infer<typeof commandRunEventSchema>;
export type CommandOutputEvent = z.infer<typeof commandOutputEventSchema>;
export type FileSnapshotEvent = z.infer<typeof fileSnapshotEventSchema>;
export type TestRunEvent = z.infer<typeof testRunEventSchema>;
export type DependencyChangeEvent = z.infer<typeof dependencyChangeEventSchema>;
export type RiskyActionEvent = z.infer<typeof riskyActionEventSchema>;
export type AgentMessageEvent = z.infer<typeof agentMessageEventSchema>;
export type ErrorEvent = z.infer<typeof errorEventSchema>;
export type BlackboxEvent = z.infer<typeof blackboxEventSchema>;
export type BlackboxEventType = BlackboxEvent["type"];

export const eventSchemas = {
  SessionStart: sessionStartEventSchema,
  SessionEnd: sessionEndEventSchema,
  CommandRun: commandRunEventSchema,
  CommandOutput: commandOutputEventSchema,
  FileSnapshot: fileSnapshotEventSchema,
  TestRun: testRunEventSchema,
  DependencyChange: dependencyChangeEventSchema,
  RiskyAction: riskyActionEventSchema,
  AgentMessage: agentMessageEventSchema,
  ErrorEvent: errorEventSchema
} as const;

export function parseBlackboxEvent(input: unknown): BlackboxEvent {
  return blackboxEventSchema.parse(input);
}

export function blackboxEventJsonSchema() {
  return zodToJsonSchema(blackboxEventSchema, {
    name: "BlackboxEvent",
    target: "jsonSchema7"
  });
}
