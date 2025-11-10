import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <section className="mx-auto max-w-3xl py-16 text-center space-y-4">
      <h1 className="text-4xl font-bold tracking-tight">Artilib — trouvez les pros de confiance</h1>
      <p className="text-gray-600">
        Un réseau fiable de professionnels proches de vous, notés et vérifiés.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button asChild><Link href="/pros">Voir les pros</Link></Button>
        <Button variant="outline" asChild><Link href="/api/pros">Voir l’API</Link></Button>
      </div>
    </section>
  );
}
