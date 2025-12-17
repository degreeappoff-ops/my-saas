"use client";

import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";

// ✅ CSS FullCalendar v6 (bons chemins)
import "@fullcalendar/core/index.cjs";
import "@fullcalendar/daygrid/index.cjs";
import "@fullcalendar/timegrid/index.cjs";

type CalEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps?: { isBooked?: boolean };
};

export default function ProAvailabilityCalendar() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadEvents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pro/availability", { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Impossible de charger les créneaux");
      setEvents(json.events || []);
    } catch (e: any) {
      setError(e.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function handleSelect(selectInfo: DateSelectArg) {
    setError(null);

    try {
      const res = await fetch("/api/pro/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: selectInfo.start.toISOString(),
          end: selectInfo.end.toISOString(),
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Erreur création créneau");

      setEvents((prev) => [...prev, json.event]);
    } catch (e: any) {
      setError(e.message || "Erreur inconnue");
    } finally {
      selectInfo.view.calendar.unselect();
    }
  }

  async function handleEventClick(clickInfo: EventClickArg) {
    setError(null);

    const isBooked = Boolean((clickInfo.event.extendedProps as any)?.isBooked);
    if (isBooked) {
      setError("Créneau réservé : suppression impossible.");
      return;
    }

    if (!confirm("Supprimer ce créneau ?")) return;

    try {
      const res = await fetch(`/api/pro/availability/${clickInfo.event.id}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Erreur suppression");

      setEvents((prev) =>
        prev.filter((e) => e.id !== clickInfo.event.id)
      );
    } catch (e: any) {
      setError(e.message || "Erreur inconnue");
    }
  }

  const calendarEvents = useMemo(
    () =>
      events.map((e) => ({
        ...e,
        classNames: e.extendedProps?.isBooked
          ? ["fc-booked"]
          : ["fc-available"],
      })),
    [events]
  );

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-gray-600">Chargement…</p>}

      <div className="border rounded bg-white p-2">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridDay,timeGridWeek,dayGridMonth",
          }}
          selectable
          select={handleSelect}
          eventClick={handleEventClick}
          events={calendarEvents}
          slotDuration="00:30:00"
          snapDuration="00:30:00"
          allDaySlot={false}
          nowIndicator
          height="auto"
        />
      </div>

      <style jsx global>{`
        .fc-booked {
          background-color: #e5e7eb !important;
          border-color: #9ca3af !important;
        }
        .fc-available {
          background-color: #111827 !important;
          border-color: #111827 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}
