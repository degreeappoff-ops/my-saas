import { headers } from "next/headers";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Types de l'API
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

async function fetchPros(params: Record<string, string | number | undefined>) {
  const h = await headers();
  const host = h.get("host")!;
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  }
  const url = `${protocol}://${host}/api/pros?${qs.toString()}`;

  // On peut activer un petit cache revalidate en prod, garde no-store si tu préfères pour débug
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) {
    console.error("GET /pros -> /api/pros failed", res.status, await res.text());
    return { professionals: [], nextCursor: null as string | null };
  }
  return (await res.json()) as { professionals: Pro[]; nextCursor: string | null };
}

export default async function ProsPage({
  searchParams,
}: {
  searchParams?: { q?: string; city?: string; profession?: string; take?: string; cursor?: string };
}) {
  const q = searchParams?.q ?? "";
  const city = searchParams?.city ?? "";
  const profession = searchParams?.profession ?? "";
  const take = Number(searchParams?.take ?? "10");
  const cursor = searchParams?.cursor;

  const { professionals, nextCursor } = await fetchPros({ q, city, profession, take, cursor });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Trouver un professionnel</h1>

      {/* Formulaire de recherche (GET) */}
      <form className="grid grid-cols-1 md:grid-cols-4 gap-3" action="/pros" method="get">
        <input
          name="q"
          placeholder="Mot-clé (plombier, rénovation, ...)"
          defaultValue={q}
          className="border rounded-md px-3 py-2"
        />
        <input
          name="city"
          placeholder="Ville (Paris, Lyon, ...)"
          defaultValue={city}
          className="border rounded-md px-3 py-2"
        />
        <input
          name="profession"
          placeholder="Métier (Plombier, Électricien...)"
          defaultValue={profession}
          className="border rounded-md px-3 py-2"
        />
        <button className="border bg-black text-white rounded-md px-3 py-2">Rechercher</button>
        {/* take caché pour contrôler la pagination */}
        <input type="hidden" name="take" value={take} />
      </form>

      {/* Liste */}
      {professionals.length === 0 ? (
        <p className="text-gray-500">Aucun résultat.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {professionals.map((p) => (
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

      {/* Pagination “Charger plus” */}
      <div className="pt-2">
        {nextCursor ? (
          <Link
            className="inline-block border rounded-md px-3 py-2 hover:bg-gray-50"
            href={`/pros?${new URLSearchParams({
              q,
              city,
              profession,
              take: String(take),
              cursor: nextCursor,
            }).toString()}`}
          >
            Charger plus
          </Link>
        ) : (
          <span className="text-gray-400 text-sm">Fin de liste</span>
        )}
      </div>
    </section>
  );
}
