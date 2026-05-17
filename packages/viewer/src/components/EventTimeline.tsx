import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import type { BlackboxEvent } from "nactograph-core";
import { EventCard } from "./EventCard.js";

export function EventTimeline({ events }: { events: BlackboxEvent[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 230,
    overscan: 8
  });

  return (
    <section className="timelinePanel">
      <div ref={parentRef} className="timelineScroller">
        <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const event = events[virtualItem.index]!;
            return (
              <div
                key={event.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`
                }}
              >
                <EventCard event={event} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
