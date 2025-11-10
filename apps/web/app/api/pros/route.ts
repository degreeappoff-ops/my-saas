import { NextResponse } from "next/server";
import { z } from "zod";

// On importe prisma depuis @repo/db si dispo.
// En cas de problème (module absent, DB KO), on bascule en fallback local.
let prisma: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  prisma = require("@repo/db").prisma;
} catch {
  prisma = null;
}

// -----------------------------
// Validation des query params
// -----------------------------
const QuerySchema = z.object({
  take: z
    .string()
    .transform((v) => Number(v))
    .pipe(z.number().min(1).max(50))
    .optional(),
  cursor: z.string().optional(),
  city: z.string().trim().min(1).optional(),
  profession: z.string().trim().min(1).optional(),
  q: z.string().trim().min(1).optional(),
});

// -----------------------------
// Fallback data (si DB indispo)
// -----------------------------
const MOCK_PROS = [
  {
    id: "mock-1",
    profession: "Plombier",
    city: "Paris",
    areaKm: 20,
    bio: "Intervention rapide, devis clair.",
    ratingAvg: 4.6,
    ratingCount: 12,
    user: { email: "pro1@example.com", name: "Bob Pro" },
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-2",
    profession: "Électricien",
    city: "Lyon",
    areaKm: 15,
    bio: "Dépannage & rénovation.",
    ratingAvg: 4.8,
    ratingCount: 31,
    user: { email: "elec@example.com", name: "Alice Watts" },
    createdAt: new Date().toISOString(),
  },
];

// Filtrage simple pour le fallback
function filterMock(params: { q?: string; city?: string; profession?: string; take: number; cursor?: string }) {
  const { q, city, profession, take, cursor } = params;
  let list = MOCK_PROS;

  if (city) list = list.filter((p) => (p.city ?? "").toLowerCase() === city.toLowerCase());
  if (profession) list = list.filter((p) => p.profession.toLowerCase() === profession.toLowerCase());
  if (q) {
    const qq = q.toLowerCase();
    list = list.filter(
      (p) =>
        p.profession.toLowerCase().includes(qq) ||
        (p.city ?? "").toLowerCase().includes(qq) ||
        (p.bio ?? "").toLowerCase().includes(qq) ||
        (p.user?.name ?? "").toLowerCase().includes(qq) ||
        (p.user?.email ?? "").toLowerCase().includes(qq)
    );
  }

  // pagination cursor très simple sur l'array (id)
  let startIdx = 0;
  if (cursor) {
    const idx = list.findIndex((p) => p.id === cursor);
    if (idx >= 0) startIdx = idx + 1;
  }
  const page = list.slice(startIdx, startIdx + take + 1);
  const hasMore = page.length > take;
  if (hasMore) page.pop();
  const nextCursor = hasMore ? page.at(-1)!.id : null;

  return { professionals: page, nextCursor, count: page.length };
}

// -----------------------------
// Handler GET
// -----------------------------
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: "Bad query", details: parsed.error.flatten() }, { status: 400 });
    }

    const { take = 20, cursor, city, profession, q } = parsed.data;

    // Si prisma indisponible ou si la DB lève une erreur → fallback
    if (!prisma) {
      const data = filterMock({ q, city, profession, take, cursor });
      return NextResponse.json(data, { status: 200 });
    }

    // Construction du where pour Prisma
    const where: any = {
      ...(city ? { city } : {}),
      ...(profession ? { profession } : {}),
      ...(q
        ? {
            OR: [
              { profession: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
              { bio: { contains: q, mode: "insensitive" } },
              { user: { name: { contains: q, mode: "insensitive" } } },
              { user: { email: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const pros = await prisma.professional.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const nextCursor = pros.length > take ? pros.pop()!.id : null;

    return NextResponse.json({ nextCursor, count: pros.length, professionals: pros }, { status: 200 });
  } catch (err) {
    console.error("Erreur /api/pros :", err);
    // En cas d’erreur DB à chaud → fallback mock
    const url = new URL(req.url);
    const obj = Object.fromEntries(url.searchParams);
    const take = Math.min(50, Number(obj.take ?? 20));
    const data = filterMock({
      q: obj.q as string | undefined,
      city: obj.city as string | undefined,
      profession: obj.profession as string | undefined,
      take,
      cursor: obj.cursor as string | undefined,
    });
    return NextResponse.json({ ...data, fallback: true }, { status: 200 });
  }
}
