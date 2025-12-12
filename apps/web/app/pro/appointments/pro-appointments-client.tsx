"use client";

import { useState } from "react";

type AppointmentClient = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  userName: string;
  userEmail: string;
  slotStart: string | null;
  slotEnd: string | null;
};

export default function ProAppointmentsClient({
  appointments: initialAppointments,
}: {
  appointments: AppointmentClient[];
}) {
  const [appointments, setAppointments] =
    useState<AppointmentClient[]>(initialAppointments);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  function formatSlot(a: AppointmentClient) {
    if (!a.slotStart || !a.slotEnd) return "Créneau non précisé";
    const s = new Date(a.slotStart);
    const e = new Date(a.slotEnd);
    return `${s.toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    })} → ${e.toLocaleTimeString("fr-FR", { timeStyle: "short" })}`;
  }

  async function updateStatus(id: string, status: "ACCEPTED" | "REJECTED") {
    setLoadingId(id);
    setError(null);

    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: id, status }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.error || "Erreur lors de la mise à jour");
      }

      const updated = json as { id: string; status: "PENDING" | "ACCEPTED" | "REJECTED" };

      setAppointments((prev) =>
        prev.map((a) => (a.id === updated.id ? { ...a, status: updated.status } : a))
      );
    } catch (e: any) {
      setError(e.message || "Erreur inconnue");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold mb-2">Mes rendez-vous</h1>
        <p className="text-sm text-gray-600">
          Consultez et gérez les demandes de rendez-vous reçues.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {appointments.length === 0 ? (
        <p className="text-sm text-gray-600">Aucun rendez-vous pour le moment.</p>
      ) : (
        <table className="w-full border text-sm bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1 text-left">Date demande</th>
              <th className="border px-2 py-1 text-left">Client</th>
              <th className="border px-2 py-1 text-left">Créneau</th>
              <th className="border px-2 py-1 text-left">Statut</th>
              <th className="border px-2 py-1 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td className="border px-2 py-1">{formatDate(a.createdAt)}</td>
                <td className="border px-2 py-1">
                  <div>{a.userName || "(Nom inconnu)"}</div>
                  <div className="text-xs text-gray-500">{a.userEmail}</div>
                </td>
                <td className="border px-2 py-1">{formatSlot(a)}</td>
                <td className="border px-2 py-1">
                  {a.status === "PENDING" && (
                    <span className="text-orange-600">En attente</span>
                  )}
                  {a.status === "ACCEPTED" && (
                    <span className="text-green-600">Confirmé</span>
                  )}
                  {a.status === "REJECTED" && (
                    <span className="text-red-600">Refusé</span>
                  )}
                </td>
                <td className="border px-2 py-1 space-x-2">
                  <button
                    type="button"
                    disabled={loadingId === a.id || a.status !== "PENDING"}
                    className="text-xs px-2 py-1 border rounded"
                    onClick={() => updateStatus(a.id, "ACCEPTED")}
                  >
                    Confirmer
                  </button>
                  <button
                    type="button"
                    disabled={loadingId === a.id || a.status !== "PENDING"}
                    className="text-xs px-2 py-1 border rounded text-red-700 border-red-400"
                    onClick={() => updateStatus(a.id, "REJECTED")}
                  >
                    Refuser
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
