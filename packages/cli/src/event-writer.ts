import type { BlackboxEvent } from "nactograph-core";
import { blackboxEventSchema } from "nactograph-core";
import { mkdir, open, type FileHandle } from "node:fs/promises";
import path from "node:path";

export class EventWriter {
  private handle: FileHandle | null = null;

  constructor(private readonly filePath: string) {}

  get path(): string {
    return this.filePath;
  }

  async open(): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    this.handle = await open(this.filePath, "a");
  }

  async write(event: BlackboxEvent): Promise<void> {
    if (!this.handle) {
      throw new Error("EventWriter must be opened before writing events.");
    }

    const parsed = blackboxEventSchema.parse(event);
    await this.handle.write(`${JSON.stringify(parsed)}\n`);
    await this.handle.sync();
  }

  async close(): Promise<void> {
    if (!this.handle) {
      return;
    }

    await this.handle.close();
    this.handle = null;
  }
}
