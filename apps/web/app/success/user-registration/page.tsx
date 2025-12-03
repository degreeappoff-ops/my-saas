"use client";

import Link from "next/link";

export default function UserRegistrationSuccess() {
  return (
    <div className="max-w-xl mx-auto py-20 text-center">
      <h1 className="text-3xl font-bold mb-4">
        Votre compte a bien été créé 🎉
      </h1>

      <p className="text-lg text-gray-700 mb-6">
        Merci pour votre inscription. Vous pouvez maintenant vous connecter
        dès que la page de connexion sera disponible.
      </p>

      <p className="text-gray-600 mb-10">
        Très bientôt, vous pourrez réserver des rendez-vous avec les
        professionnels disponibles sur la plateforme.
      </p>

      <Link
        href="/"
        className="inline-block bg-black text-white px-6 py-3 rounded-lg text-lg hover:bg-gray-900 transition"
      >
        Retour à l’accueil
      </Link>
    </div>
  );
}
