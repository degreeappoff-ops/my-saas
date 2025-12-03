import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers"; // ⚠️ PAS d'accolades ici
import Navbar from "@/components/app/Navbar";

export const metadata: Metadata = {
  title: "Mon SaaS",
  description: "Plateforme de prise de rendez-vous",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-50">
        <Providers>
          <Navbar />
          <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
