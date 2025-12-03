import { NextResponse } from "next/server";
import { z } from "zod";

// Prisma via package partagé (fallback si absent)
let prisma: any = null;
try {
  prisma = require("@repo/db").prisma;
} catch {
  prisma = null;
}

// Helpers zod: transformer "" -> undefined
const StrOpt = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? v.trim() : undefined));

const QuerySchema = z.object({
  take: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined))
    .pipe(z.number().min(1).max(50).optional()),
  cursor: StrOpt,
  city: StrOpt,
  profession: StrOpt,
  q: StrOpt,
});

// Fallback mémoire pour les créations quand la DB est KO
const FALLBACK_STORE: any[] = [];

const CreateProSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  profession: z.string().min(1),
  city: z.string().optional(),
  areaKm: z.coerce.number().int().min(0).max(200).optional(),
  bio: z.string().optional(),
});

export async function POST(req: Request) {
  const log = createReqLogger("POST /api/pros");
  try {
    // 1) Auth: réservé aux PRO
    const session = await auth();
    // @ts-ignore
    const role = session?.user?.role ?? "USER";
    if (role !== "PRO") {
      log.info("Forbidden (not PRO)", session?.user);
      return NextResponse.json({ error: "Accès réservé aux PRO" }, { status: 403 });
    }

    // 2) Validation
    const json = await req.json().catch(() => ({}));
    const parsed = CreateProSchema.safeParse(json);
    if (!parsed.success) {
      log.info("Bad input", parsed.error.flatten());
      return NextResponse.json({ error: "Bad input", details: parsed.error.flatten() }, { status: 400 });
    }
    const { email, name, profession, city, areaKm, bio } = parsed.data;

    // 3) Prisma si dispo, sinon fallback
    let prisma: any = null;
    try { prisma = require("@repo/db").prisma; } catch { prisma = null; }

    if (!prisma) {
      const id = "fb-" + Math.random().toString(36).slice(2);
      const pro = {
        id,
        profession,
        city: city ?? null,
        areaKm: areaKm ?? null,
        bio: bio ?? null,
        ratingAvg: 0,
        ratingCount: 0,
        user: { email, name },
        createdAt: new Date().toISOString(),
      };
      FALLBACK_STORE.unshift(pro);
      log.info("Created in fallback", pro);
      return NextResponse.json({ created: true, professional: pro, fallback: true }, { status: 201 });
    }

    // 4) Chemin DB (upsert User, puis upsert Professional)
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, role: "PRO" },
      create: { email, name, role: "PRO" },
    });

    const pro = await prisma.professional.upsert({
      where: { userId: user.id },
      update: { profession, city, areaKm, bio },
      create: { userId: user.id, profession, city, areaKm, bio },
      include: { user: true },
    });

    log.info("Created in DB", pro.id);
    return NextResponse.json({ created: true, professional: pro }, { status: 201 });
  } catch (err) {
    log.error("Crash", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  } finally {
    log.end();
  }
}
