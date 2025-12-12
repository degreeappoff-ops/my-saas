// apps/web/app/pros/[id]/pro-booking-client.tsx
"use client";

import { useState } from "react";

type SlotClient = {
  id: string;
  start: string; // ISO
  end: string;   // ISO
};

export default function ProBookingClient({ slots }: { slots: SlotClient[] }) {
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function formatSlot(isoStart: string, isoEnd: string) {
    const s = new Date(isoStart);
    const e = new Date(isoEnd);
    return `${s.toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    })} → ${e.toLocaleTimeString("fr-FR", { timeStyle: "short" })}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedSlot) {
      setError("Merci de sélectionner un créneau.");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlot, // 🔹 on envoie seulement le slot
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          json.error ||
            "Impossible d'envoyer la demande. Êtes-vous bien connecté en tant qu'utilisateur ?"
        );
      }

      setMessage(
        "Votre demande de rendez-vous a bien été envoyée. Vous serez averti une fois le rendez-vous confirmé."
      );
    } catch (e: any) {
      setError(e.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  if (slots.length === 0) {
    return (
      <div className="border rounded px-4 py-3 bg-white">
        <h2 className="font-semibold mb-2">Prendre rendez-vous</h2>
        <p className="text-sm text-gray-600">
          Ce professionnel n&apos;a pas encore indiqué de disponibilités en
          ligne ou tous les créneaux sont réservés. Vous pouvez le contacter
          directement par email.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded px-4 py-3 bg-white space-y-3">
      <h2 className="font-semibold mb-2">Prendre rendez-vous</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <select
          className="border rounded px-3 py-2 text-sm w-full"
          value={selectedSlot}
          onChange={(e) => setSelectedSlot(e.target.value)}
        >
          <option value="">Sélectionnez un créneau…</option>
          {slots.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {formatSlot(slot.start, slot.end)}
            </option>
          ))}
        </select>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-black text-white text-sm"
        >
          {loading ? "Envoi..." : "Demander ce rendez-vous"}
        </button>
      </form>

      <p className="text-xs text-gray-500">
        Vous devez être connecté en tant qu&apos;utilisateur pour envoyer une
        demande de rendez-vous.
      </p>
    </div>
  );
}
