import { headers } from "next/headers";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ProUser = { email: string; name: string | null };
type Pro = {
  id: string;
  profession: string;
  city: string | null;
  areaKm: number | null;
  bio: string | null;
  ratingAvg: number | null;
  ratingCount: number | null;
  user: ProUser;
};

async function getPros(): Promise<Pro[]> {
  const h = await headers();
  const host = h.get("host")!;
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}/api/pros`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.professionals ?? []) as Pro[];
}

export default async function ProsPage() {
  const pros = await getPros();

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Professionnels</h1>

      {pros.length === 0 ? (
        <p className="text-gray-500">Aucun pro pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pros.map((p) => (
            <Card key={p.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-medium">{p.user?.name ?? "Pro anonyme"}</div>
                  <div className="text-sm text-gray-500">{p.user?.email}</div>
                </div>
                <Badge>{p.profession}</Badge>
              </div>

              <div className="mt-3 text-sm text-gray-700 space-y-1">
                {p.city && <div>Ville : {p.city}</div>}
                {p.areaKm && <div>Rayon d’intervention : {p.areaKm} km</div>}
                {p.bio && <div className="text-gray-600">{p.bio}</div>}
              </div>

              <div className="mt-3 text-sm">
                Note : {p.ratingAvg ?? 0} ({p.ratingCount ?? 0} avis)
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
