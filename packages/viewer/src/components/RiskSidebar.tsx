import type { RiskFinding } from "nactograph-core";

export function RiskSidebar({ findings }: { findings: RiskFinding[] }) {
  return (
    <aside className="riskSidebar">
      <h2>Risk Findings</h2>
      {findings.length === 0 ? <p className="muted">No findings</p> : null}
      {findings.map((finding, index) => (
        <article className={`finding ${finding.severity}`} key={`${finding.rule}-${index}`}>
          <strong>{finding.rule}</strong>
          <span>{finding.severity}</span>
          <p>{finding.evidence}</p>
        </article>
      ))}
    </aside>
  );
}
