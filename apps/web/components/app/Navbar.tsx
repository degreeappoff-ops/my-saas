"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  let role = "ANON";

  if (status === "loading") {
    role = "...";
  } else {
    const userRole = (session?.user as any)?.role;
    if (userRole) role = userRole;
  }

  const isAuthed = status === "authenticated";
  const isUser = role === "USER";

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-5xl mx-auto flex items-center justify-between py-3 px-4">
        <Link href="/" className="font-semibold text-lg">
          Mon SaaS
        </Link>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            Chemin : <span className="font-mono">{pathname}</span> / Rôle :{" "}
            <span className="font-semibold">{role}</span>
          </span>

          <Link href="/pros" className="text-sm text-gray-700">
            Voir les pros
          </Link>

          {/* ✅ Visible uniquement si rôle USER */}
          {isAuthed && isUser && (
            <Link href="/appointments" className="text-sm text-gray-700">
              Mes rendez-vous
            </Link>
          )}

          {isAuthed ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs border px-2 py-1 rounded"
            >
              Se déconnecter
            </button>
          ) : (
            <Link
              href="/signin/ui"
              className="text-xs border px-2 py-1 rounded"
            >
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
