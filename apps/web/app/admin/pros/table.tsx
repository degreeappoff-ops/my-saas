"use client";

import { useEffect, useState } from "react";

type ProStatus = "PENDING" | "APPROVED" | "REJECTED";

type ProProfile = {
  id: string;
  businessName: string | null;
  trade: string | null;
  city: string | null;
  status: ProStatus;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
};

export default function AdminProsTable() {
  const [pros, setPros] = useState<ProProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadPros() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/pros");
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Erreur lors du chargement");
      }
      const data = await res.json();
      setPros(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPros();
  }, []);

  async function updateStatus(id: string, status: ProStatus) {
    try {
      setActionLoadingId(id);
      setError(null);
      const res = await fetch("/api/admin/pros", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ proProfileId: id, status }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Erreur lors de la mise à jour");
      }

      await loadPros();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Erreur inconnue");
    } finally {
      setActionLoadingId(null);
    }
  }

  if (loading) {
    return <p>Chargement des professionnels...</p>;
  }

  if (error) {
    return (
      <div className="space-y-2">
        <p className="text-red-600">Erreur : {error}</p>
        <button
          onClick={loadPros}
          className="text-sm px-3 py-1 border rounded"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (pros.length === 0) {
    return <p>Aucun professionnel pour le moment.</p>;
  }

  return (
    <div className="space-y-4">
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1 text-left">Nom</th>
            <th className="border px-2 py-1 text-left">Entreprise</th>
            <th className="border px-2 py-1 text-left">Métier</th>
            <th className="border px-2 py-1 text-left">Ville</th>
            <th className="border px-2 py-1 text-left">Email</th>
            <th className="border px-2 py-1 text-left">Statut</th>
            <th className="border px-2 py-1 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pros.map((pro) => (
            <tr key={pro.id}>
              <td className="border px-2 py-1">
                {pro.user.name || "(sans nom)"}
              </td>
              <td className="border px-2 py-1">
                {pro.businessName || "(non renseigné)"}
              </td>
              <td className="border px-2 py-1">
                {pro.trade || "(non renseigné)"}
              </td>
              <td className="border px-2 py-1">
                {pro.city || "(non renseigné)"}
              </td>
              <td className="border px-2 py-1">{pro.user.email}</td>
              <td className="border px-2 py-1">
                <span
                  className={
                    pro.status === "PENDING"
                      ? "text-orange-600"
                      : pro.status === "APPROVED"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {pro.status}
                </span>
              </td>
              <td className="border px-2 py-1 space-x-2">
                <button
                  disabled={actionLoadingId === pro.id}
                  onClick={() => updateStatus(pro.id, "APPROVED")}
                  className="text-xs px-2 py-1 border rounded"
                >
                  Approuver
                </button>
                <button
                  disabled={actionLoadingId === pro.id}
                  onClick={() => updateStatus(pro.id, "PENDING")}
                  className="text-xs px-2 py-1 border rounded"
                >
                  Remettre en attente
                </button>
                <button
                  disabled={actionLoadingId === pro.id}
                  onClick={() => updateStatus(pro.id, "REJECTED")}
                  className="text-xs px-2 py-1 border rounded text-red-700 border-red-400"
                >
                  Blacklister
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-xs text-gray-500">
        NB : ce tableau affiche tous les ProProfile, y compris ceux en attente,
        approuvés et rejetés.
      </p>
    </div>
  );
}
