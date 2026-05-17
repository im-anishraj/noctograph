import {
  Activity,
  Braces,
  CheckCircle2,
  Clipboard,
  Code2,
  Database,
  FileJson2,
  LockKeyhole,
  PackageCheck,
  Radar,
  ScanLine,
  ShieldCheck,
  Terminal,
  Workflow,
  Zap
} from "lucide-react";
import type { CSSProperties } from "react";
import { useState } from "react";
import reportPreview from "../../../../docs/demo-report.png";
import {
  artifactOutputs,
  captureMatrix,
  footerLinks,
  installCommand,
  navItems,
  proofStats,
  recorderEvents,
  replaySteps,
  riskFindings,
  terminalLines
} from "../content";

export function LandingPage() {
  const [copied, setCopied] = useState(false);

  const copyInstall = async () => {
    await navigator.clipboard.writeText(installCommand);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <>
      <Header />
      <Hero copied={copied} onCopy={copyInstall} />
      <ProofStrip />
      <ReplaySection />
      <CaptureSystem />
      <RiskSection />
      <LocalFirstSection />
      <ArtifactsSection />
      <DemoSection copied={copied} onCopy={copyInstall} />
      <SiteFooter copied={copied} onCopy={copyInstall} />
    </>
  );
}

function Header() {
  return (
    <header className="siteNav" aria-label="Primary navigation">
      <a className="brand" href="#product" aria-label="Nactograph home">
        <span className="brandMark">N</span>
        <span>Nactograph</span>
      </a>
      <nav className="navLinks">
        {navItems.map((item) => (
          <a key={item.label} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <a className="navCta" href="#install">
        Install
      </a>
    </header>
  );
}

function Hero({ copied, onCopy }: { copied: boolean; onCopy: () => Promise<void> }) {
  return (
    <section className="hero" id="product">
      <div className="heroGrid" aria-hidden="true" />
      <div className="heroTraces" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="heroCopy">
        <p className="eyebrow">Local-first flight recorder for AI coding agents</p>
        <h1>
          Nactograph
          <span>Every AI agent run, replayed like evidence.</span>
        </h1>
        <p className="heroLead">
          A command-center for agentic code review: terminal streams, file diffs, redactions, tests, dependency changes, and risk
          signals captured as one shareable replay.
        </p>
        <div className="heroActions">
          <a className="primaryAction" href="#install">
            <Terminal size={18} aria-hidden="true" />
            Install CLI
          </a>
          <a className="secondaryAction" href="#replay">
            <ScanLine size={18} aria-hidden="true" />
            Watch replay
          </a>
        </div>
        <CommandCopy copied={copied} onCopy={onCopy} />
      </div>
      <CommandCenter />
    </section>
  );
}

function CommandCenter() {
  return (
    <div className="commandCenter" aria-label="Nactograph recorder preview">
      <div className="centerChrome">
        <span className="chromeDot" />
        <span className="chromeDot" />
        <span className="chromeDot" />
        <strong>session_2026_05_17</strong>
        <em>redaction active</em>
      </div>
      <div className="centerBody">
        <section className="terminalViewport" aria-label="Captured terminal stream">
          <div className="panelHeader">
            <span>Terminal capture</span>
            <strong>PTY live</strong>
          </div>
          <pre>
            {terminalLines.map((line, index) => (
              <span key={line} style={{ "--line": index } as CSSProperties}>
                {line}
              </span>
            ))}
          </pre>
        </section>
        <section className="timelineViewport" aria-label="Event timeline preview">
          <div className="timelineRail" />
          {recorderEvents.slice(0, 5).map((event, index) => (
            <article className={`timelineEvent tone-${event.tone}`} key={event.type} style={{ "--delay": `${index * 0.14}s` } as CSSProperties}>
              <time>{event.time}</time>
              <strong>{event.type}</strong>
              <span>{event.detail}</span>
            </article>
          ))}
        </section>
        <section className="riskInstrument" aria-label="Risk score preview">
          <div className="riskDial">
            <span>12</span>
          </div>
          <strong>Risk score</strong>
          <p>Readable rules. Evidence attached.</p>
        </section>
        <section className="diffInstrument" aria-label="Diff preview">
          <div className="panelHeader">
            <span>src/auth.test.ts</span>
            <strong>+42 -8</strong>
          </div>
          <div className="diffRows">
            <span className="removed">- expect(role).toBe("guest")</span>
            <span className="added">+ expect(role).toBe("member")</span>
            <span className="added">+ await login({"{"} retry: true {"}"})</span>
          </div>
        </section>
      </div>
      <div className="recorderCore" aria-hidden="true">
        <span />
        <span />
      </div>
    </div>
  );
}

function ProofStrip() {
  return (
    <section className="proofStrip" aria-label="Product proof" data-reveal>
      {proofStats.map((stat) => (
        <article key={stat.label}>
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
          <p>{stat.detail}</p>
        </article>
      ))}
    </section>
  );
}

function ReplaySection() {
  return (
    <section className="replaySection sectionBand" id="replay" data-reveal>
      <div className="sectionCopy">
        <p className="eyebrow">Replay, not vibes</p>
        <h2>Scrub the agent run like a cockpit recorder.</h2>
        <p>
          Every command becomes a timestamp. Every diff gets context. Every risk finding points to the evidence that triggered it.
        </p>
      </div>
      <div className="replayConsole" aria-label="Replay timeline">
        <div className="scrubber">
          <span />
        </div>
        {replaySteps.map((item, index) => (
          <article className="replayStep" key={item.title} style={{ "--delay": `${index * 0.18}s` } as CSSProperties}>
            <span>{item.step}</span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CaptureSystem() {
  return (
    <section className="captureSection" aria-label="Captured event system" data-reveal>
      <div className="sectionHeader">
        <p className="eyebrow">Structured recorder log</p>
        <h2>Built from the events reviewers actually need.</h2>
      </div>
      <div className="captureGrid">
        {captureMatrix.map((event, index) => (
          <article key={event.name} style={{ "--delay": `${index * 0.08}s` } as CSSProperties}>
            <EventIcon index={index} />
            <strong>{event.name}</strong>
            <p>{event.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function RiskSection() {
  return (
    <section className="riskSection sectionBand" id="risk" data-reveal>
      <div className="riskCopy">
        <p className="eyebrow">Typed rules, visible evidence</p>
        <h2>Risk scoring that engineers can argue with.</h2>
        <p>
          No mystery model between you and the finding. Nactograph ships readable TypeScript rules for destructive commands,
          secret access, deleted tests, lockfile churn, dependency deltas, and suspicious diff shape.
        </p>
      </div>
      <div className="riskStack" aria-label="Risk findings">
        {riskFindings.map((risk, index) => (
          <article className={`riskCard severity-${risk.severity}`} key={risk.rule} style={{ "--delay": `${index * 0.12}s` } as CSSProperties}>
            <Radar size={18} aria-hidden="true" />
            <span>{risk.severity}</span>
            <strong>{risk.rule}</strong>
            <p>{risk.evidence}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function LocalFirstSection() {
  return (
    <section className="localSection" data-reveal>
      <div className="localProof">
        <LockKeyhole size={28} aria-hidden="true" />
        <p className="eyebrow">Local-first by design</p>
        <h2>The report is yours before it is shareable.</h2>
        <p>
          Secrets are redacted before storage. Session folders stay on disk. The HTML report is static, portable, and ready for
          pull requests, incident review, or launch demos.
        </p>
      </div>
      <div className="redactionLedger" aria-label="Redaction ledger preview">
        <div>
          <span>OPENAI_API_KEY</span>
          <strong>masked in output</strong>
        </div>
        <div>
          <span>.env.local</span>
          <strong>snapshot blocked</strong>
        </div>
        <div>
          <span>10.0.0.5 token URL</span>
          <strong>private host removed</strong>
        </div>
      </div>
    </section>
  );
}

function ArtifactsSection() {
  return (
    <section className="artifactSection" id="examples" data-reveal>
      <div className="sectionHeader">
        <p className="eyebrow">Three artifacts, three audiences</p>
        <h2>Use the right proof in the right conversation.</h2>
      </div>
      <div className="artifactGrid">
        {artifactOutputs.map((artifact, index) => (
          <article key={artifact.name}>
            {index === 0 ? <ShieldCheck size={24} /> : index === 1 ? <FileJson2 size={24} /> : <Braces size={24} />}
            <span>{artifact.role}</span>
            <strong>{artifact.name}</strong>
            <p>{artifact.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function DemoSection({ copied, onCopy }: { copied: boolean; onCopy: () => Promise<void> }) {
  return (
    <section className="demoSection" id="install" data-reveal>
      <div className="demoCopy">
        <p className="eyebrow">Install, run, review</p>
        <h2>One command turns the next agent run into evidence.</h2>
        <CommandCopy copied={copied} onCopy={onCopy} />
      </div>
      <figure className="reportPreview">
        <img src={reportPreview} alt="Nactograph report with timeline, diffs, and risk findings" />
      </figure>
    </section>
  );
}

function SiteFooter({ copied, onCopy }: { copied: boolean; onCopy: () => Promise<void> }) {
  return (
    <footer className="siteFooter">
      <div>
        <a className="brand" href="#product" aria-label="Nactograph home">
          <span className="brandMark">N</span>
          <span>Nactograph</span>
        </a>
        <p>Local-first flight recorder for AI coding agents. MIT licensed. Version 0.1.0.</p>
      </div>
      <CommandCopy copied={copied} onCopy={onCopy} compact />
      <nav aria-label="Footer links">
        {footerLinks.map((link) => (
          <a key={link.label} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}

function CommandCopy({ copied, onCopy, compact = false }: { copied: boolean; onCopy: () => Promise<void>; compact?: boolean }) {
  return (
    <div className={compact ? "commandCopy commandCopyCompact" : "commandCopy"}>
      <code>{installCommand}</code>
      <button type="button" onClick={() => void onCopy()} aria-label="Copy install command">
        {copied ? <CheckCircle2 size={18} aria-hidden="true" /> : <Clipboard size={18} aria-hidden="true" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function EventIcon({ index }: { index: number }) {
  const icons = [
    <Activity size={18} aria-hidden="true" />,
    <Terminal size={18} aria-hidden="true" />,
    <Code2 size={18} aria-hidden="true" />,
    <Workflow size={18} aria-hidden="true" />,
    <Zap size={18} aria-hidden="true" />,
    <Database size={18} aria-hidden="true" />,
    <Radar size={18} aria-hidden="true" />,
    <PackageCheck size={18} aria-hidden="true" />
  ];

  return <span className="eventIcon">{icons[index] ?? <Activity size={18} aria-hidden="true" />}</span>;
}
