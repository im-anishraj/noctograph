import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { generateHtmlReport } from "./html.js";
import { generateMarkdownReport } from "./markdown.js";
import { createSessionReportData, parseJsonlEvents } from "./session.js";

export interface ReportArtifactPaths {
  htmlPath: string;
  markdownPath: string;
}

export async function generateReportArtifacts(jsonlPath: string): Promise<ReportArtifactPaths> {
  const events = parseJsonlEvents(await readFile(jsonlPath, "utf8"));
  const data = createSessionReportData(events);
  const outputDir = path.dirname(jsonlPath);
  const htmlPath = path.join(outputDir, "blackbox-report.html");
  const markdownPath = path.join(outputDir, "blackbox-pr-comment.md");

  await writeFile(htmlPath, generateHtmlReport(data), "utf8");
  await writeFile(markdownPath, generateMarkdownReport(data), "utf8");

  return { htmlPath, markdownPath };
}
