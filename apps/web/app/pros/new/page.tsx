import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function NewProPage() {
  const session = await auth();
  // @ts-ignore
  const role = session?.user?.role ?? "USER";

  if (role !== "PRO") {
    return (
      <div className="mx-auto max-w-xl py-12 space-y-4">
        <h1 className="text-xl font-semibold">Accès restreint</h1>
        <p>Cette page est réservée aux comptes <b>PRO</b>.</p>
        <Link className="underline" href="/(auth)/signin">Se connecter</Link>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-xl py-12 space-y-4">
      <h1 className="text-2xl font-semibold">Ajouter / Mettre à jour mon profil PRO</h1>

      <form
        className="space-y-3"
        action={async (formData: FormData) => {
          "use server";
          const payload = {
            email: String(formData.get("email") ?? ""),
            name: String(formData.get("name") ?? ""),
            profession: String(formData.get("profession") ?? ""),
            city: String(formData.get("city") ?? ""),
            areaKm: String(formData.get("areaKm") ?? ""),
            bio: String(formData.get("bio") ?? ""),
          };

          const res = await fetch(`${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/pros`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            console.error("POST /api/pros failed", res.status, await res.text());
            throw new Error("Échec de la création");
          }
        }}
      >
        <input name="email" className="border rounded-md w-full px-3 py-2" placeholder="Email du pro" required />
        <input name="name" className="border rounded-md w-full px-3 py-2" placeholder="Nom" required />
        <input name="profession" className="border rounded-md w-full px-3 py-2" placeholder="Métier (ex: Plombier)" required />
        <input name="city" className="border rounded-md w-full px-3 py-2" placeholder="Ville (optionnel)" />
        <input name="areaKm" className="border rounded-md w-full px-3 py-2" placeholder="Rayon km (optionnel)" />
        <textarea name="bio" className="border rounded-md w-full px-3 py-2" placeholder="Bio (optionnel)" />
        <button className="border bg-black text-white rounded-md px-3 py-2">Enregistrer</button>
      </form>

      <p className="text-sm text-gray-500">
        Astuce dev : si la DB est KO, l’API passe en <i>fallback</i> mémoire (les ajouts sont visibles dans ta session).
      </p>
      <p><Link className="underline" href="/pros">← Retour à la liste</Link></p>
    </section>
  );
}
