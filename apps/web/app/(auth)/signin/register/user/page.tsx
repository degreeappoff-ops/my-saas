"use client";

import { useState } from "react";
import { z } from "zod";
import { registerUserSchema } from "@/lib/validation/registerUserSchema";
import { useRouter } from "next/navigation";

type FormData = z.infer<typeof registerUserSchema>;

export default function RegisterUserPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const raw = Object.fromEntries(form) as Record<string, string>;

    const parsed = registerUserSchema.safeParse(raw);
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;

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

    const res = await fetch("/api/auth/register-user", {
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

    // Redirection vers la page de succès utilisateur
    router.push("/success/user-registration");
  }

  return (
    <div className="max-w-xl mx-auto py-20">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Inscription Utilisateur
      </h1>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

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

        <button
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>
    </div>
  );
}
