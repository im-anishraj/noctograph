import type { BlackboxEvent, BlackboxEventType, RiskSeverity } from "nactograph-core";

const severities: Array<RiskSeverity | "All"> = ["All", "high", "medium", "low"];

export function FilterBar({
  events,
  eventType,
  severity,
  query,
  onEventTypeChange,
  onSeverityChange,
  onQueryChange
}: {
  events: BlackboxEvent[];
  eventType: BlackboxEventType | "All";
  severity: RiskSeverity | "All";
  query: string;
  onEventTypeChange(value: BlackboxEventType | "All"): void;
  onSeverityChange(value: RiskSeverity | "All"): void;
  onQueryChange(value: string): void;
}) {
  const eventTypes = ["All", ...new Set(events.map((event) => event.type))] as Array<BlackboxEventType | "All">;

  return (
    <section className="filterBar">
      <select value={eventType} onChange={(event) => onEventTypeChange(event.currentTarget.value as BlackboxEventType | "All")}>
        {eventTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <select value={severity} onChange={(event) => onSeverityChange(event.currentTarget.value as RiskSeverity | "All")}>
        {severities.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <input value={query} onChange={(event) => onQueryChange(event.currentTarget.value)} placeholder="Search events" />
    </section>
  );
}
