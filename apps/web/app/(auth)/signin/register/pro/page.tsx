"use client";

import { useState } from "react";
import { registerProSchema } from "@/lib/validation/registerProSchema";
import { z } from "zod";
import { useRouter } from "next/navigation";

type FormData = z.infer<typeof registerProSchema>;

export default function RegisterProPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const raw = Object.fromEntries(form) as Record<string, string>;

    // On normalise les champs optionnels : "" -> undefined
    const data: any = {
      ...raw,
      zipcode: raw.zipcode || undefined,
      description: raw.description || undefined,
      publicEmail: raw.publicEmail || undefined,
      publicPhone: raw.publicPhone || undefined,
    };

    const parsed = registerProSchema.safeParse(data);
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;

      // 🔎 Priorité : mot de passe
      if (fields.password && fields.password[0]) {
        setError(fields.password[0]);
      } else if (fields.email && fields.email[0]) {
        setError(fields.email[0]);
      } else if (fields.name && fields.name[0]) {
        setError(fields.name[0]);
      } else {
        setError("Veuillez vérifier les informations du formulaire.");
      }

      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register-pro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.data),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error || "Erreur lors de l'inscription");
      setLoading(false);
      return;
    }

    // Succès -> redirection vers la page de connexion
    router.push("/success/pro-registration");
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Inscription Professionnel</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Votre nom complet"
          className="w-full border p-2 rounded"
        />
        <input
          name="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
        />
        <input
          name="password"
          type="password"
          placeholder="Mot de passe (min. 10 caractères)"
          className="w-full border p-2 rounded"
        />

        <input
          name="businessName"
          placeholder="Nom de votre entreprise"
          className="w-full border p-2 rounded"
        />
        <input
          name="trade"
          placeholder="Métier (ex: Plombier)"
          className="w-full border p-2 rounded"
        />

        <input
          name="city"
          placeholder="Ville"
          className="w-full border p-2 rounded"
        />
        <input
          name="zipcode"
          placeholder="Code postal"
          className="w-full border p-2 rounded"
        />

        <textarea
          name="description"
          placeholder="Description"
          className="w-full border p-2 rounded"
        />

        <input
          name="publicEmail"
          placeholder="Email public (optionnel)"
          className="w-full border p-2 rounded"
        />
        <input
          name="publicPhone"
          placeholder="Téléphone public (optionnel)"
          className="w-full border p-2 rounded"
        />

        <button
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {loading ? "Création..." : "Créer mon compte PRO"}
        </button>
      </form>
    </div>
  );
}
