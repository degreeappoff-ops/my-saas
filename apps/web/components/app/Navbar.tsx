"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-5xl mx-auto flex items-center justify-between py-3 px-4">
        <Link href="/" className="font-semibold text-lg">
          Mon SaaS
        </Link>

        <div className="text-sm text-gray-600">
          Chemin : <span className="font-mono">{pathname}</span> / Rôle :{" "}
          <span className="font-semibold">ANON</span>
        </div>
      </div>
    </header>
  );
}
