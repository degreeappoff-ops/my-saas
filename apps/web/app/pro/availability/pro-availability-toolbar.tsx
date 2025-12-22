"use client";

import { useState } from "react";
import ProWorkingHoursModal from "./pro-working-hours-modal";

export default function ProAvailabilityToolbar() {
  const [open, setOpen] = useState(false);
  const [loadingGen, setLoadingGen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [daysAhead, setDaysAhead] = useState<number>(14);

  async function generate() {
    setLoadingGen(true);
    setMsg(null);

    try {
      const res = await fetch("/api/pro/availability/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ daysAhead }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Erreur lors de la génération");
      }

      setMsg(`Créneaux générés ✅ (${json.created} ajoutés sur ${json.daysAhead} jours)`);
      // reload pour recharger les slots côté server component
      window.location.reload();
    } catch (e: any) {
      setMsg(e.message || "Erreur inconnue");
    } finally {
      setLoadingGen(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Mes disponibilités</h1>
          <p className="text-sm text-gray-600">
            Configure tes horaires, puis génère automatiquement des créneaux (pas 30 min).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="border rounded px-3 py-2 text-sm"
            onClick={() => setOpen(true)}
          >
            Configurer mes horaires
          </button>

          <div className="flex items-center gap-2">
            <select
              className="border rounded px-2 py-2 text-sm"
              value={daysAhead}
              onChange={(e) => setDaysAhead(Number(e.target.value))}
              disabled={loadingGen}
            >
              <option value={7}>7 jours</option>
              <option value={14}>14 jours</option>
              <option value={30}>30 jours</option>
            </select>

            <button
              className="bg-black text-white rounded px-3 py-2 text-sm"
              onClick={generate}
              disabled={loadingGen}
            >
              {loadingGen ? "Génération..." : "Générer mes créneaux"}
            </button>
          </div>
        </div>

        <ProWorkingHoursModal open={open} onClose={() => setOpen(false)} />
      </div>

      {msg && <p className="text-sm text-gray-700">{msg}</p>}
    </div>
  );
}
