"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const Item = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`px-3 py-2 rounded-md text-sm font-medium transition
          ${active ? "bg-black text-white" : "hover:bg-gray-100"}
        `}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="w-full border-b bg-white">
      <nav className="mx-auto max-w-5xl flex items-center gap-2 px-4 py-3">
        <Link href="/" className="font-semibold mr-4">Artilib</Link>
        {Item("/", "Accueil")}
        {Item("/pros", "Pros")}
      </nav>
    </header>
  );
}
