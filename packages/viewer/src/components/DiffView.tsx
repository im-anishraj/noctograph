import { html } from "diff2html";
import "diff2html/bundles/css/diff2html.min.css";

export function DiffView({ diff }: { diff: string }) {
  return <div className="diffView" dangerouslySetInnerHTML={{ __html: html(diff, { drawFileList: false, matching: "lines", outputFormat: "line-by-line" }) }} />;
}
