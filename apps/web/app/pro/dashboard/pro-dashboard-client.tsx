"use client";

import Link from "next/link";

type ProProfileClient =
  | {
      id: string;
      businessName: string;
      trade: string;
      city: string;
      zipcode: string | null;
      description: string | null;
      publicEmail: string | null;
      publicPhone: string | null;
      status: "PENDING" | "APPROVED" | "REJECTED";
    }
  | null;

export default function ProDashboardClient({
  proProfile,
}: {
  proProfile: ProProfileClient;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard PRO</h1>
        <p className="text-sm text-gray-600">
          Gérez votre profil, vos disponibilités et vos rendez-vous.
        </p>
      </div>

      {/* Bloc profil */}
      <div className="border rounded bg-white p-4 space-y-2">
        {!proProfile ? (
          <>
            <p className="text-sm text-red-600 font-medium">
              Profil professionnel introuvable.
            </p>
            <p className="text-sm text-gray-600">
              (Normalement, un profil pro doit exister si votre compte est PRO.)
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg">{proProfile.businessName}</div>
                <div className="text-sm text-gray-600">
                  {proProfile.trade} · {proProfile.city}
                  {proProfile.zipcode ? ` (${proProfile.zipcode})` : ""}
                </div>
              </div>

              <div className="text-sm">
                {proProfile.status === "PENDING" && (
                  <span className="px-2 py-1 rounded bg-orange-50 text-orange-700 border border-orange-200">
                    En attente
                  </span>
                )}
                {proProfile.status === "APPROVED" && (
                  <span className="px-2 py-1 rounded bg-green-50 text-green-700 border border-green-200">
                    Approuvé
                  </span>
                )}
                {proProfile.status === "REJECTED" && (
                  <span className="px-2 py-1 rounded bg-red-50 text-red-700 border border-red-200">
                    Refusé
                  </span>
                )}
              </div>
            </div>

            {proProfile.description && (
              <p className="text-sm text-gray-700">{proProfile.description}</p>
            )}

            <div className="text-xs text-gray-500">
              Email public : {proProfile.publicEmail || "—"} · Téléphone public :{" "}
              {proProfile.publicPhone || "—"}
            </div>
          </>
        )}
      </div>

      {/* ✅ Boutons demandés */}
      <div className="border rounded bg-white p-4">
        <h2 className="font-semibold mb-3">Raccourcis</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/pro/availability"
            className="px-4 py-2 rounded bg-black text-white text-sm w-fit"
          >
            Mes disponibilités
          </Link>

          <Link
            href="/pro/appointments"
            className="px-4 py-2 rounded border text-sm w-fit"
          >
            Ma gestion de rendez-vous
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Astuce : ajoutez des disponibilités pour que les utilisateurs puissent
          réserver.
        </p>
      </div>
    </div>
  );
}
