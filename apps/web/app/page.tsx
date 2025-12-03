import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold mb-2">Accueil</h1>
      <p className="text-slate-700">
        Bienvenue sur ta plateforme. Pour l’instant, seule l’inscription est
        disponible (pas encore de connexion).
      </p>

      <ul className="list-disc list-inside space-y-2 mt-4">
        <li>
          <Link href="/signin/register/user" className="text-blue-600 underline">
            Créer un compte Utilisateur
          </Link>
        </li>
        <li>
          <Link href="/signin/register/pro" className="text-blue-600 underline">
            Créer un compte Professionnel
          </Link>
        </li>
      </ul>
    </section>
  );
}
