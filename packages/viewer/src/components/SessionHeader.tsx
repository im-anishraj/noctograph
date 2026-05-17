import type { SessionReportData } from "../types.js";

export function SessionHeader({ session }: { session: SessionReportData }) {
  return (
    <header className="sessionHeader">
      <div>
        <p className="eyebrow">Agent Blackbox</p>
        <h1>{session.command}</h1>
      </div>
      <div className={`riskBadge ${riskTone(session.risk.score)}`}>{session.risk.score}/100</div>
      <div className="metricStrip">
        <Metric label="Duration" value={`${(session.metrics.durationMs / 1000).toFixed(1)}s`} />
        <Metric label="Files" value={String(session.metrics.filesChanged)} />
        <Metric label="Commands" value={String(session.metrics.commandsRun)} />
        <Metric label="Tests" value={`${session.metrics.testsPassed}/${session.metrics.testsRun}`} />
      </div>
    </header>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function riskTone(score: number): string {
  if (score >= 70) return "danger";
  if (score >= 35) return "warn";
  return "calm";
}
