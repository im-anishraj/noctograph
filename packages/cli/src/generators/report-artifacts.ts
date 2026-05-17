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

  await writeFile(htmlPath, await generateEmbeddableHtml(data), "utf8");
  await writeFile(markdownPath, generateMarkdownReport(data), "utf8");

  return { htmlPath, markdownPath };
}

async function generateEmbeddableHtml(data: ReturnType<typeof createSessionReportData>): Promise<string> {
  const viewerHtml = await readBuiltViewerHtml();
  if (!viewerHtml) {
    return generateHtmlReport(data);
  }

  const injected = `<script>window.__BLACKBOX_SESSION__ = ${JSON.stringify(data).replaceAll("</script", "<\\/script")};</script>`;
  return viewerHtml.includes("</head>") ? viewerHtml.replace("</head>", `${injected}</head>`) : `${injected}${viewerHtml}`;
}

async function readBuiltViewerHtml(): Promise<string | null> {
  const candidates = [
    process.env.AGENT_BLACKBOX_VIEWER_HTML,
    path.resolve(process.cwd(), "packages/viewer/dist/index.html"),
    path.resolve(process.cwd(), "../viewer/dist/index.html")
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    try {
      return await readFile(candidate, "utf8");
    } catch {
      // Try the next known development/package location.
    }
  }

  return null;
}
