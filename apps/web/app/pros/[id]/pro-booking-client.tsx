"use client";

import { useEffect, useMemo, useState } from "react";

type SlotClient = {
  id: string;
  start: string; // ISO
  end: string;   // ISO
};

function dateKey(iso: string) {
  const d = new Date(iso);
  // YYYY-MM-DD en local
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function prettyDay(yyyyMMdd: string) {
  const d = new Date(`${yyyyMMdd}T00:00:00`);
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function prettyTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function ProBookingClient({ slots }: { slots: SlotClient[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, SlotClient[]>();
    for (const s of slots) {
      const k = dateKey(s.start);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(s);
    }
    // tri des jours + tri des heures
    const keys = Array.from(map.keys()).sort();
    for (const k of keys) {
      map.get(k)!.sort((a, b) => (a.start < b.start ? -1 : 1));
    }
    return { map, keys };
  }, [slots]);

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ init date sélectionnée (si slots existent)
  useEffect(() => {
    if (!selectedDate && grouped.keys.length > 0) {
      setSelectedDate(grouped.keys[0]);
    }
    // reset slot quand on change les données
    if (grouped.keys.length === 0) {
      setSelectedDate("");
      setSelectedSlotId("");
    }
  }, [grouped.keys.join("|")]); // ok pour déclencher quand keys changent

  const daySlots = selectedDate ? grouped.map.get(selectedDate) ?? [] : [];

  async function book() {
    if (!selectedSlotId) {
      setError("Merci de sélectionner une heure.");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: selectedSlotId }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          json.error ||
            "Impossible de réserver. Êtes-vous connecté en tant qu'utilisateur ?"
        );
      }

      setMessage("Rendez-vous réservé ✅");
    } catch (e: any) {
      setError(e?.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  if (slots.length === 0) {
    return (
      <div className="border rounded p-4 bg-white">
        <h2 className="font-semibold mb-2">Prendre rendez-vous</h2>
        <p className="text-sm text-gray-600">
          Aucun créneau disponible pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded p-4 bg-white space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Prendre rendez-vous</h2>
        <p className="text-xs text-gray-500">
          Sélectionnez un jour puis une heure (pas de 30 min).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Colonne jours */}
        <div className="border rounded p-3">
          <div className="text-xs font-semibold text-gray-600 mb-2">
            Jours disponibles
          </div>
          <div className="space-y-2">
            {grouped.keys.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setSelectedDate(k);
                  setSelectedSlotId("");
                  setMessage(null);
                  setError(null);
                }}
                className={[
                  "w-full text-left px-3 py-2 rounded border text-sm",
                  selectedDate === k ? "bg-black text-white" : "bg-white",
                ].join(" ")}
              >
                {prettyDay(k)}
              </button>
            ))}
          </div>
        </div>

        {/* Colonne heures */}
        <div className="md:col-span-2 border rounded p-3">
          <div className="text-xs font-semibold text-gray-600 mb-2">
            Heures disponibles
          </div>

          {daySlots.length === 0 ? (
            <p className="text-sm text-gray-600">
              Aucun créneau pour ce jour.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {daySlots.map((s) => {
                const label = `${prettyTime(s.start)} - ${prettyTime(s.end)}`;
                const active = selectedSlotId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSlotId(s.id)}
                    className={[
                      "px-3 py-2 rounded border text-sm",
                      active ? "bg-black text-white" : "bg-white",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-4 space-y-2">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-green-700">{message}</p>}

            <button
              type="button"
              onClick={book}
              disabled={loading || !selectedSlotId}
              className="px-4 py-2 rounded bg-black text-white text-sm disabled:opacity-50"
            >
              {loading ? "Réservation..." : "Réserver"}
            </button>

            <p className="text-xs text-gray-500">
              Vous devez être connecté en tant qu&apos;utilisateur pour réserver.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
