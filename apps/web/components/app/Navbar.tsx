"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = (session?.user as any)?.role ?? "ANON";

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-5xl mx-auto flex items-center justify-between py-3 px-4">
        <Link href="/" className="font-semibold text-lg">
          Mon SaaS
        </Link>

        <div className="text-sm text-gray-600">
          Chemin : <span className="font-mono">{pathname}</span> / Rôle :{" "}
          <span className="font-semibold">{role}</span>
        </div>
      </div>
    </header>
  );
}
