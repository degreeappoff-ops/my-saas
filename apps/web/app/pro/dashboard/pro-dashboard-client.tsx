"use client";

import { useState } from "react";

type ProStatus = "PENDING" | "APPROVED" | "REJECTED";

type ProProfileClient = {
  id: string;
  businessName: string | null;
  trade: string | null;
  city: string | null;
  zipcode: string | null;
  description: string | null;
  publicEmail: string | null;
  publicPhone: string | null;
  status: ProStatus;
};

export default function ProDashboardClient({
  proProfile,
}: {
  proProfile: ProProfileClient | null;
}) {
  const [form, setForm] = useState({
    businessName: proProfile?.businessName || "",
    trade: proProfile?.trade || "",
    city: proProfile?.city || "",
    zipcode: proProfile?.zipcode || "",
    description: proProfile?.description || "",
    publicEmail: proProfile?.publicEmail || "",
    publicPhone: proProfile?.publicPhone || "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!proProfile) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Dashboard PRO</h1>
        <p className="text-red-600">
          Aucun profil professionnel n&apos;a été trouvé pour ce compte.
        </p>
        <p className="text-sm text-gray-600">
          Si vous venez de vous inscrire, il est possible que le profil soit en
          cours de création. Sinon, contactez l&apos;administration.
        </p>
      </div>
    );
  }

  const statusLabel = getStatusLabel(proProfile.status);
  const statusColor = getStatusColor(proProfile.status);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/pro/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Erreur lors de la sauvegarde");
      }

      setMessage("Profil mis à jour avec succès.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  }

  function handleChange(
    field: keyof typeof form,
    value: string
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard PRO</h1>
        <p className="text-sm text-gray-600">
          Gérez ici votre fiche professionnelle.
        </p>
      </div>

      {/* Bandeau de statut */}
      <div
        className={`border rounded px-4 py-3 text-sm ${statusColor.bg} ${statusColor.text}`}
      >
        <p>
          Statut de votre compte :{" "}
          <span className="font-semibold">{statusLabel}</span>
        </p>
        {proProfile.status === "PENDING" && (
          <p className="mt-1">
            Votre profil est en attente de validation par l&apos;administration.
          </p>
        )}
        {proProfile.status === "APPROVED" && (
          <p className="mt-1">
            Votre profil est visible dans la liste des professionnels.
          </p>
        )}
        {proProfile.status === "REJECTED" && (
          <p className="mt-1">
            Votre profil a été rejeté ou blacklisté. Contactez
            l&apos;administration pour plus d&apos;informations.
          </p>
        )}
      </div>

      {/* Formulaire de profil */}
      <form onSubmit={handleSubmit} className="space-y-4 border rounded p-4 bg-white">
        <h2 className="font-semibold text-lg mb-2">
          Vos informations professionnelles
        </h2>

        <div className="space-y-1">
          <label className="text-sm font-medium">Nom de votre entreprise</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 text-sm"
            value={form.businessName}
            onChange={(e) => handleChange("businessName", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Métier</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 text-sm"
            value={form.trade}
            onChange={(e) => handleChange("trade", e.target.value)}
            placeholder="Électricien, plombier, etc."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Ville</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Code postal</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.zipcode}
              onChange={(e) => handleChange("zipcode", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2 text-sm min-h-[80px]"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email public</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.publicEmail}
              onChange={(e) => handleChange("publicEmail", e.target.value)}
              placeholder="Affiché sur votre fiche (optionnel)"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Téléphone public</label>
            <input
              type="tel"
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.publicPhone}
              onChange={(e) => handleChange("publicPhone", e.target.value)}
              placeholder="Affiché sur votre fiche (optionnel)"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        {message && (
          <p className="text-sm text-green-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 px-4 py-2 rounded bg-black text-white text-sm"
        >
          {saving ? "Sauvegarde..." : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
}

function getStatusLabel(status: ProStatus) {
  switch (status) {
    case "PENDING":
      return "En attente de validation";
    case "APPROVED":
      return "Approuvé";
    case "REJECTED":
      return "Rejeté / blacklisté";
    default:
      return status;
  }
}

function getStatusColor(status: ProStatus) {
  switch (status) {
    case "PENDING":
      return { bg: "bg-yellow-50", text: "text-yellow-800" };
    case "APPROVED":
      return { bg: "bg-green-50", text: "text-green-800" };
    case "REJECTED":
      return { bg: "bg-red-50", text: "text-red-800" };
    default:
      return { bg: "bg-gray-50", text: "text-gray-800" };
  }
}
