"use client";

import { useEffect, useState } from "react";

type DayRow = {
  day: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  enabled: boolean;
  startMin: number;
  endMin: number;
};

const LABEL: Record<DayRow["day"], string> = {
  MON: "Lundi",
  TUE: "Mardi",
  WED: "Mercredi",
  THU: "Jeudi",
  FRI: "Vendredi",
  SAT: "Samedi",
  SUN: "Dimanche",
};

function minToHHMM(min: number) {
  const h = Math.floor(min / 60).toString().padStart(2, "0");
  const m = Math.floor(min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function hhmmToMin(v: string) {
  const [h, m] = v.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 540;
  return Math.max(0, Math.min(24 * 60, h * 60 + m));
}

export default function ProWorkingHoursModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [days, setDays] = useState<DayRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setMsg(null);

    fetch("/api/pro/working-hours")
      .then((r) => r.json())
      .then((json) => setDays(json.days || []))
      .catch(() => setMsg("Impossible de charger les horaires."))
      .finally(() => setLoading(false));
  }, [open]);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/pro/working-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Erreur de sauvegarde.");
      }
      setMsg("Horaires sauvegardés ✅");
    } catch (e: any) {
      setMsg(e.message || "Erreur inconnue.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded shadow p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Configurer mes horaires</h2>
          <button className="text-sm underline" onClick={onClose}>
            Fermer
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-600">Chargement…</p>
        ) : (
          <div className="space-y-2">
            {days.map((d, idx) => (
              <div
                key={d.day}
                className="border rounded p-3 flex items-center justify-between gap-3"
              >
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={d.enabled}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setDays((prev) =>
                        prev.map((x, i) => (i === idx ? { ...x, enabled } : x))
                      );
                    }}
                  />
                  <span className="font-medium">{LABEL[d.day]}</span>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    className="border rounded px-2 py-1 text-sm"
                    value={minToHHMM(d.startMin)}
                    disabled={!d.enabled}
                    step={1800} // 30 min
                    onChange={(e) => {
                      const startMin = hhmmToMin(e.target.value);
                      setDays((prev) =>
                        prev.map((x, i) =>
                          i === idx ? { ...x, startMin } : x
                        )
                      );
                    }}
                  />
                  <span className="text-gray-500">→</span>
                  <input
                    type="time"
                    className="border rounded px-2 py-1 text-sm"
                    value={minToHHMM(d.endMin)}
                    disabled={!d.enabled}
                    step={1800}
                    onChange={(e) => {
                      const endMin = hhmmToMin(e.target.value);
                      setDays((prev) =>
                        prev.map((x, i) => (i === idx ? { ...x, endMin } : x))
                      );
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {msg && <p className="text-sm text-gray-700">{msg}</p>}

        <div className="flex gap-2 justify-end">
          <button className="border rounded px-3 py-2 text-sm" onClick={onClose}>
            Annuler
          </button>
          <button
            className="bg-black text-white rounded px-3 py-2 text-sm"
            onClick={save}
            disabled={saving}
          >
            {saving ? "Sauvegarde…" : "Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  );
}
