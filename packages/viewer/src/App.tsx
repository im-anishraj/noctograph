import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import type { BlackboxEvent, BlackboxEventType, RiskSeverity } from "nactograph-core";
import { EventTimeline } from "./components/EventTimeline.js";
import { FilterBar } from "./components/FilterBar.js";
import { RiskSidebar } from "./components/RiskSidebar.js";
import { SessionHeader } from "./components/SessionHeader.js";
import { createSessionReportData, parseJsonlEvents } from "./session.js";
import type { SessionReportData } from "./types.js";

const severityRank: Record<RiskSeverity, number> = { high: 0, medium: 1, low: 2 };

export function App() {
  const [session, setSession] = useState<SessionReportData | null>(() => window.__BLACKBOX_SESSION__ ?? null);
  const [eventType, setEventType] = useState<BlackboxEventType | "All">("All");
  const [severity, setSeverity] = useState<RiskSeverity | "All">("All");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    if (!session) {
      return [];
    }

    const byType = session.events.filter((event) => eventType === "All" || event.type === eventType);
    if (query.trim().length === 0) {
      return byType;
    }

    return new Fuse(byType, {
      includeScore: true,
      threshold: 0.32,
      keys: ["type", "payload"]
    })
      .search(query)
      .map((result) => result.item);
  }, [eventType, query, session]);

  const findings = useMemo(() => {
    if (!session) {
      return [];
    }

    return session.risk.findings
      .filter((finding) => severity === "All" || finding.severity === severity)
      .sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
  }, [session, severity]);

  async function loadFile(file: File) {
    try {
      setError(null);
      setSession(createSessionReportData(parseJsonlEvents(await file.text())));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load session.");
    }
  }

  if (!session) {
    return (
      <main
        className="empty"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files.item(0);
          if (file) void loadFile(file);
        }}
      >
        <label className="dropZone">
          <input
            type="file"
            accept=".jsonl,application/jsonl,text/plain"
            onChange={(event) => {
              const file = event.currentTarget.files?.item(0);
              if (file) void loadFile(file);
            }}
          />
          <span>Drop a session JSONL</span>
        </label>
        {error ? <p className="error">{error}</p> : null}
      </main>
    );
  }

  return (
    <main className="appShell">
      <SessionHeader session={session} />
      <FilterBar
        events={session.events}
        eventType={eventType}
        severity={severity}
        query={query}
        onEventTypeChange={setEventType}
        onSeverityChange={setSeverity}
        onQueryChange={setQuery}
      />
      <section className="contentGrid">
        <RiskSidebar findings={findings} />
        <EventTimeline events={filteredEvents} />
      </section>
    </main>
  );
}
