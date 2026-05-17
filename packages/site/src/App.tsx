import {
  ArrowRight,
  Braces,
  CheckCircle2,
  Clipboard,
  FileJson2,
  FileText,
  GitBranch,
  Github,
  LockKeyhole,
  PackageCheck,
  Radar,
  ShieldCheck,
  Terminal,
  TimerReset
} from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import reportPreview from "../../../docs/demo-report.png";
import { artifacts, captureEvents, liveCaptureLines, metrics, riskRules, terminalLines, workflowSteps } from "./content";

const installCommand = "npm install -g nactograph";

export function App() {
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const revealItems = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.16 }
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  const copyInstall = async () => {
    await navigator.clipboard.writeText(installCommand);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main ref={rootRef}>
      <section className="hero" id="top">
        <div className="motionField" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="heroPreview" aria-hidden="true">
          <img src={reportPreview} alt="" />
          <span className="scanBeam" />
          <span className="previewBadge previewBadgeOne">JSONL writing live</span>
          <span className="previewBadge previewBadgeTwo">risk 12/100</span>
        </div>
        <div className="heroWash" />
        <header className="nav" aria-label="Primary navigation">
          <a className="brand" href="#top" aria-label="Nactograph home">
            <span className="brandMark">N</span>
            <span>Nactograph</span>
          </a>
          <nav className="navLinks">
            <a href="#flow">Flow</a>
            <a href="#risk">Risk</a>
            <a href="#artifacts">Artifacts</a>
            <a href="https://github.com/im-anishraj/noctograph">GitHub</a>
          </nav>
          <a className="navInstall" href="#install">
            Install
          </a>
        </header>

        <div className="heroInner">
          <p className="eyebrow revealLine">Local-first flight recorder for AI coding agents</p>
          <h1>
            <span>Nactograph</span>
          </h1>
          <p className="heroLead">
            Replay every command, terminal stream, file diff, redaction event, test result, and risk signal before agent-written
            code reaches review.
          </p>
          <div className="heroActions">
            <a className="primaryAction" href="#install">
              <Terminal size={18} aria-hidden="true" />
              Install CLI
            </a>
            <a className="secondaryAction" href="https://github.com/im-anishraj/noctograph/releases/tag/v0.1.0">
              <Github size={18} aria-hidden="true" />
              View release
            </a>
          </div>
          <div className="commandBar" id="install">
            <code>{installCommand}</code>
            <button type="button" onClick={() => void copyInstall()} aria-label="Copy install command">
              {copied ? <CheckCircle2 size={18} aria-hidden="true" /> : <Clipboard size={18} aria-hidden="true" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="liveRail" aria-label="Live capture preview">
            {liveCaptureLines.map((line, index) => (
              <article className={`liveLine tone-${line.tone}`} key={line.value} style={{ "--delay": `${index * 0.22}s` } as CSSProperties}>
                <span>{line.label}</span>
                <strong>{line.value}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="metricRail" aria-label="Product metrics" data-reveal>
        {metrics.map((metric) => (
          <article key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <p>{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="eventMarquee" aria-label="Captured event stream">
        <div className="marqueeTrack">
          {[...captureEvents, ...captureEvents].map((eventName, index) => (
            <span key={`${eventName}-${index}`}>{eventName}</span>
          ))}
        </div>
      </section>

      <section className="splitSection" id="flow" data-reveal>
        <div>
          <p className="eyebrow">Auditable by default</p>
          <h2>Turn agent sessions into evidence.</h2>
          <p>
            Nactograph wraps any command in a pseudo-terminal, keeps the session feeling normal, and writes a validated JSONL
            event stream in real time.
          </p>
        </div>
        <div className="flowCanvas" aria-label="Recorder workflow">
          <span className="flowPulse" aria-hidden="true" />
          {workflowSteps.map((step, index) => (
            <article className="flowNode" key={step.title} style={{ "--step": index + 1 } as CSSProperties}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step.title}</strong>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="reportSection" data-reveal>
        <div className="reportCopy">
          <p className="eyebrow">The artifact reviewers can trust</p>
          <h2>One run. Three files. Full replay.</h2>
          <p>
            The generated report is self-contained and built for scanning: summary, risk score, filters, event cards, terminal
            output, and file-level diffs.
          </p>
          <a className="textLink" href="https://github.com/im-anishraj/noctograph/tree/main/examples/demo-session">
            Explore the demo session
            <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
        <figure className="reportFrame">
          <img src={reportPreview} alt="Nactograph report showing command timeline and risk score" />
          <span className="reportSweep" aria-hidden="true" />
        </figure>
      </section>

      <section className="eventSection" data-reveal>
        <div className="sectionHeader">
          <p className="eyebrow">Structured recorder log</p>
          <h2>Event types that match how agents actually work.</h2>
        </div>
        <div className="eventGrid">
          {captureEvents.map((eventName, index) => (
            <article key={eventName}>
              <span>{index % 3 === 0 ? <Terminal size={18} /> : index % 3 === 1 ? <GitBranch size={18} /> : <FileText size={18} />}</span>
              <strong>{eventName}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="splitSection riskSection" id="risk" data-reveal>
        <div>
          <p className="eyebrow">Rules you can read</p>
          <h2>Risk detection without a mystery model.</h2>
          <p>
            The risk engine is pure TypeScript and rule-based, so teams can understand why a session was flagged and decide what
            should block review.
          </p>
        </div>
        <div className="riskBoard">
          {riskRules.map((rule, index) => (
            <article key={rule}>
              <Radar size={18} aria-hidden="true" />
              <span>{index < 2 ? "medium" : index < 4 ? "high" : "watch"}</span>
              <strong>{rule}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="privacySection" data-reveal>
        <div className="privacyCard">
          <LockKeyhole size={28} aria-hidden="true" />
          <h2>Local-first means local-first.</h2>
          <p>
            Secrets are redacted before storage, output is captured on disk, and reports are generated as static artifacts you
            control.
          </p>
        </div>
        <div className="terminalPanel">
          <div className="terminalTop">
            <span />
            <span />
            <span />
          </div>
          <pre>
            {terminalLines.map((line, index) => (
              <span key={line} style={{ "--line": index } as CSSProperties}>
                {line}
              </span>
            ))}
          </pre>
        </div>
      </section>

      <section className="artifactSection" id="artifacts" data-reveal>
        <div className="sectionHeader">
          <p className="eyebrow">Release-ready output</p>
          <h2>Drop the right artifact into the right conversation.</h2>
        </div>
        <div className="artifactGrid">
          {artifacts.map((artifact, index) => (
            <article key={artifact.name}>
              {index === 0 ? <ShieldCheck size={24} /> : index === 1 ? <FileJson2 size={24} /> : <Braces size={24} />}
              <strong>{artifact.name}</strong>
              <p>{artifact.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="finalCta" data-reveal>
        <div>
          <PackageCheck size={30} aria-hidden="true" />
          <h2>Let agents code. Keep the black box.</h2>
          <p>Install the CLI, record the next agent run, and share the exact moment a session changed your repo.</p>
        </div>
        <a className="primaryAction" href="https://www.npmjs.com/package/nactograph">
          <TimerReset size={18} aria-hidden="true" />
          npm package
        </a>
      </section>
    </main>
  );
}
