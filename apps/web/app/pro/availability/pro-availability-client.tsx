"use client";

import { useState } from "react";

type SlotClient = {
  id: string;
  start: string; // ISO
  end: string;   // ISO
};

export default function ProAvailabilityClient({
  initialSlots,
}: {
  initialSlots: SlotClient[];
}) {
  const [slots, setSlots] = useState<SlotClient[]>(initialSlots);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addSlot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/pro/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, startTime, endTime }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Erreur lors de la création du créneau");
      }

      const slot = (await res.json()) as SlotClient;
      setSlots((prev) => [...prev, slot]);
      setDate("");
      setStartTime("");
      setEndTime("");
    } catch (e: any) {
      setError(e.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  async function deleteSlot(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pro/availability", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: id }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Erreur lors de la suppression");
      }

      setSlots((prev) => prev.filter((s) => s.id !== id));
    } catch (e: any) {
      setError(e.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  function formatSlotDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Mes disponibilités</h1>
        <p className="text-sm text-gray-600">
          Ajoutez les créneaux pendant lesquels vous pouvez recevoir des
          demandes de rendez-vous.
        </p>
      </div>

      <form
        onSubmit={addSlot}
        className="border rounded p-4 bg-white grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
      >
        <div className="space-y-1">
          <label className="text-sm font-medium">Date</label>
          <input
            type="date"
            className="border rounded px-2 py-2 text-sm w-full"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Heure début</label>
          <input
            type="time"
            className="border rounded px-2 py-2 text-sm w-full"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Heure fin</label>
          <input
            type="time"
            className="border rounded px-2 py-2 text-sm w-full"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-black text-white text-sm"
        >
          {loading ? "En cours..." : "Ajouter"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="border rounded p-4 bg-white">
        <h2 className="font-semibold mb-2 text-lg">Créneaux existants</h2>
        {slots.length === 0 ? (
          <p className="text-sm text-gray-600">
            Aucun créneau pour le moment.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {slots.map((slot) => (
              <li
                key={slot.id}
                className="flex items-center justify-between border-b pb-1 last:border-b-0"
              >
                <span>{formatSlotDate(slot.start)} → {formatSlotDate(slot.end)}</span>
                <button
                  type="button"
                  onClick={() => deleteSlot(slot.id)}
                  className="text-red-600 text-xs border rounded px-2 py-1"
                  disabled={loading}
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
