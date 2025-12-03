"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SignInForm({ error }: { error?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // ⚠️ on gère nous-mêmes la redirection
    });

    if (res?.error) {
      setLocalError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    // Récupère la session pour connaître le rôle
    const session = await getSession();
    const role = (session?.user as any)?.role;

    if (role === "PRO") {
      router.push("/pro/dashboard");
    } else if (role === "ADMIN") {
      router.push("/admin/dashboard");
    } else {
      router.push("/");
    }
  }

  const displayError =
    localError ||
    (error === "CredentialsSignin"
      ? "Email ou mot de passe incorrect."
      : error
      ? "Une erreur est survenue lors de la connexion."
      : null);

  return (
    <div className="max-w-md mx-auto py-16">
      <h1 className="text-2xl font-bold mb-6 text-center">Connexion</h1>

      {displayError && (
        <p className="text-red-500 mb-4 text-center">{displayError}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          className="bg-black text-white w-full py-2 rounded"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
