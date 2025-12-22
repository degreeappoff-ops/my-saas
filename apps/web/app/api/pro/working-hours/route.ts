import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;
type Day = (typeof DAYS)[number];

function toInt(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// GET /api/pro/working-hours
export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || user?.role !== "PRO") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pro = await prisma.proProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!pro) {
    return NextResponse.json({ error: "ProProfile introuvable" }, { status: 404 });
  }

  // Crée 7 lignes si pas existantes
  const existing = await prisma.proWorkingHours.findMany({
    where: { proId: pro.id },
  });

  if (existing.length === 0) {
    await prisma.proWorkingHours.createMany({
      data: DAYS.map((day) => ({
        proId: pro.id,
        day: day as any,
        enabled: day !== "SAT" && day !== "SUN", // défaut : semaine active
        startMin: 540, // 09:00
        endMin: 1080,  // 18:00
      })),
    });
  }

  const rows = await prisma.proWorkingHours.findMany({
    where: { proId: pro.id },
    orderBy: { day: "asc" },
    select: { day: true, enabled: true, startMin: true, endMin: true },
  });

  return NextResponse.json({ proId: pro.id, days: rows }, { status: 200 });
}

// PUT /api/pro/working-hours
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || user?.role !== "PRO") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pro = await prisma.proProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!pro) {
    return NextResponse.json({ error: "ProProfile introuvable" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const days = Array.isArray(body?.days) ? body.days : [];

  // expected: [{ day, enabled, startMin, endMin }, ...]
  const updates = days
    .filter((d: any) => DAYS.includes(d?.day))
    .map((d: any) => ({
      day: d.day as Day,
      enabled: Boolean(d.enabled),
      startMin: Math.max(0, Math.min(24 * 60, toInt(d.startMin, 540))),
      endMin: Math.max(0, Math.min(24 * 60, toInt(d.endMin, 1080))),
    }))
    .map((d) => ({
      where: { uniq_pro_day: { proId: pro.id, day: d.day as any } },
      data: {
        enabled: d.enabled,
        startMin: d.startMin,
        endMin: Math.max(d.startMin + 30, d.endMin), // garde 30 min mini
      },
    }));

  await prisma.$transaction(
    updates.map((u) => prisma.proWorkingHours.update(u as any))
  );

  return NextResponse.json({ ok: true }, { status: 200 });
}