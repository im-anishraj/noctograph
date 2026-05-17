import type { BlackboxEvent } from "nactograph-core";
import type { SessionReportData } from "./session.js";

export function generateHtmlReport(data: SessionReportData): string {
  const serialized = JSON.stringify(data).replaceAll("</script", "<\\/script");
  const cards = data.events.map(eventCard).join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Agent Blackbox Report</title>
    <style>
      :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f7f8fb; color: #172033; }
      body { margin: 0; }
      .shell { max-width: 1180px; margin: 0 auto; padding: 32px 20px 56px; }
      .hero { display: grid; gap: 18px; border-bottom: 1px solid #dfe5f2; padding-bottom: 24px; }
      .eyebrow { color: #53627a; font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
      h1 { margin: 0; font-size: clamp(32px, 5vw, 58px); line-height: 1; letter-spacing: 0; }
      .command { color: #38465d; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; overflow-wrap: anywhere; }
      .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin: 24px 0; }
      .metric { background: #fff; border: 1px solid #dfe5f2; border-radius: 8px; padding: 14px; }
      .metric span { display: block; color: #61708a; font-size: 12px; }
      .metric strong { display: block; margin-top: 6px; font-size: 24px; }
      .risk-high { color: #b42318; }
      .filters { display: flex; flex-wrap: wrap; gap: 8px; margin: 28px 0 18px; }
      button { border: 1px solid #c9d3e5; background: #fff; border-radius: 999px; padding: 8px 12px; cursor: pointer; }
      button.active { background: #172033; color: #fff; border-color: #172033; }
      .timeline { display: grid; gap: 14px; }
      .event { background: #fff; border: 1px solid #dfe5f2; border-left: 5px solid #7c8da8; border-radius: 8px; padding: 16px; box-shadow: 0 12px 28px rgba(23,32,51,.06); }
      .event.CommandRun { background: #101828; color: #eef4ff; border-left-color: #66d9ef; }
      .event.CommandOutput { border-left-color: #8fbc8f; }
      .event.FileSnapshot { border-left-color: #6554c0; }
      .event.TestRun { border-left-color: #0f766e; }
      .event.DependencyChange { border-left-color: #b7791f; }
      .event.RiskyAction { border-left-color: #d92d20; }
      .event h2 { margin: 0 0 8px; font-size: 16px; }
      .event time { color: #6b7890; font-size: 12px; }
      .event.CommandRun time { color: #9fb0cc; }
      pre { margin: 12px 0 0; white-space: pre-wrap; overflow-x: auto; font-size: 12px; line-height: 1.5; }
      .copy { float: right; border-radius: 6px; padding: 6px 9px; font-size: 12px; }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="hero">
        <div class="eyebrow">Agent Blackbox Session</div>
        <h1>Risk score <span class="risk-high">${data.risk.score}/100</span></h1>
        <div class="command">${escapeHtml(data.command)}</div>
      </section>
      <section class="metrics">
        <div class="metric"><span>Duration</span><strong>${(data.metrics.durationMs / 1000).toFixed(1)}s</strong></div>
        <div class="metric"><span>Files changed</span><strong>${data.metrics.filesChanged}</strong></div>
        <div class="metric"><span>Commands run</span><strong>${data.metrics.commandsRun}</strong></div>
        <div class="metric"><span>Tests</span><strong>${data.metrics.testsPassed}/${data.metrics.testsRun}</strong></div>
      </section>
      <section class="filters" id="filters"></section>
      <section class="timeline" id="timeline">
        ${cards}
      </section>
    </main>
    <script>window.__BLACKBOX_SESSION__ = ${serialized};</script>
    <script>
      const filters = document.getElementById("filters");
      const eventTypes = ["All", ...new Set(window.__BLACKBOX_SESSION__.events.map((event) => event.type))];
      let active = "All";
      function renderFilters() {
        filters.innerHTML = eventTypes.map((type) => '<button class="' + (type === active ? 'active' : '') + '" data-type="' + type + '">' + type + '</button>').join('');
      }
      filters.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button) return;
        active = button.dataset.type;
        document.querySelectorAll(".event").forEach((card) => {
          card.hidden = active !== "All" && card.dataset.type !== active;
        });
        renderFilters();
      });
      document.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-copy]");
        if (!button) return;
        await navigator.clipboard.writeText(button.dataset.copy);
        button.textContent = "Copied";
        setTimeout(() => (button.textContent = "Copy"), 1200);
      });
      renderFilters();
    </script>
  </body>
</html>`;
}

function eventCard(event: BlackboxEvent): string {
  const payload = JSON.stringify(event.payload, null, 2);
  const copy = escapeHtml(payload);
  const copyAttr = escapeAttribute(payload);
  return `<article class="event ${event.type}" data-type="${event.type}">
  ${event.type === "CommandRun" ? `<button class="copy" data-copy="${copyAttr}">Copy</button>` : ""}
  <h2>${event.type}</h2>
  <time>${event.ts}</time>
  <pre>${copy}</pre>
</article>`;
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replaceAll('"', "&quot;");
}
