import type { BlackboxEvent } from "@agent-blackbox/core";
import { DiffView } from "./DiffView.js";
import { TerminalOutput } from "./TerminalOutput.js";

export function EventCard({ event }: { event: BlackboxEvent }) {
  return (
    <article className={`eventCard ${event.type}`}>
      <header>
        <div>
          <h3>{event.type}</h3>
          <time>{event.ts}</time>
        </div>
        {event.type === "CommandRun" ? (
          <button type="button" onClick={() => void navigator.clipboard.writeText(`${event.payload.command} ${event.payload.args.join(" ")}`)}>
            Copy
          </button>
        ) : null}
      </header>
      {renderPayload(event)}
    </article>
  );
}

function renderPayload(event: BlackboxEvent) {
  switch (event.type) {
    case "CommandOutput":
      return <TerminalOutput text={event.payload.text} />;
    case "FileSnapshot":
      return event.payload.diff ? <DiffView diff={event.payload.diff} /> : <pre>{event.payload.content}</pre>;
    case "TestRun":
      return (
        <div>
          <span className={`statusBadge ${event.payload.status}`}>{event.payload.status}</span>
          <TerminalOutput text={event.payload.output} />
        </div>
      );
    case "DependencyChange":
      return (
        <p>
          <strong>{event.payload.packageName}</strong> {event.payload.beforeVersion ?? "none"} → {event.payload.afterVersion ?? "none"}
        </p>
      );
    case "RiskyAction":
      return <p className={`alert ${event.payload.severity}`}>{event.payload.description}</p>;
    default:
      return <pre>{JSON.stringify(event.payload, null, 2)}</pre>;
  }
}
