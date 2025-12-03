"use client";

import Link from "next/link";

export default function ProRegistrationSuccess() {
  return (
    <div className="max-w-xl mx-auto py-20 text-center">
      <h1 className="text-3xl font-bold mb-4">Votre inscription est validée ! 🎉</h1>

      <p className="text-lg text-gray-700 mb-6">
        Merci pour votre inscription. Votre compte professionnel a bien été
        créé et est actuellement en attente de validation par notre équipe.
      </p>

      <p className="text-gray-600 mb-10">
        Une fois votre profil vérifié, il apparaîtra dans la liste des
        professionnels disponibles.
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
