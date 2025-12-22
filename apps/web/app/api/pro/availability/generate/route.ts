import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fromZonedTime } from "date-fns-tz";

export const runtime = "nodejs";

const TZ = "Europe/Paris";
const WEEKDAY_TO_ENUM = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || user?.role !== "PRO") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const daysAheadRaw = Number(body?.daysAhead);
  const daysAhead = Number.isFinite(daysAheadRaw) ? daysAheadRaw : 14;
  const safeDaysAhead = Math.max(1, Math.min(60, daysAhead));

  const pro = await prisma.proProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!pro) {
    return NextResponse.json({ error: "ProProfile introuvable" }, { status: 404 });
  }

  const working = await prisma.proWorkingHours.findMany({
    where: { proId: pro.id },
    select: { day: true, enabled: true, startMin: true, endMin: true },
  });

  if (working.length === 0) {
    return NextResponse.json(
      { error: "Horaires non configurés. Clique d'abord sur 'Configurer mes horaires'." },
      { status: 400 }
    );
  }

  const workingByDay = new Map<
    string,
    { enabled: boolean; startMin: number; endMin: number }
  >();

  for (const w of working) {
    workingByDay.set(w.day as any, {
      enabled: w.enabled,
      startMin: w.startMin,
      endMin: w.endMin,
    });
  }

  const now = new Date();
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + safeDaysAhead);

  const existing = await prisma.availabilitySlot.findMany({
    where: {
      proId: pro.id,
      start: { gte: startDate, lt: endDate },
    },
    select: { start: true, end: true },
  });

  const existingKey = new Set(
    existing.map((s) => `${s.start.toISOString()}|${s.end.toISOString()}`)
  );

  const toCreate: { proId: string; start: Date; end: Date; isBooked: boolean }[] = [];

  for (let i = 0; i < safeDaysAhead; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);

    const weekdayEnum = WEEKDAY_TO_ENUM[d.getDay()];
    const cfg = workingByDay.get(weekdayEnum);

    if (!cfg || !cfg.enabled) continue;

    const startMin = Math.max(0, Math.min(24 * 60, cfg.startMin));
    const endMin = Math.max(0, Math.min(24 * 60, cfg.endMin));
    if (endMin - startMin < 30) continue;

    const dateStr = ymd(d); // YYYY-MM-DD

    for (let t = startMin; t + 30 <= endMin; t += 30) {
      const sh = Math.floor(t / 60);
      const sm = t % 60;
      const eh = Math.floor((t + 30) / 60);
      const em = (t + 30) % 60;

      // "heure locale" Europe/Paris → UTC via fromZonedTime (date-fns-tz v3)
      const localStart = `${dateStr}T${pad2(sh)}:${pad2(sm)}:00`;
      const localEnd = `${dateStr}T${pad2(eh)}:${pad2(em)}:00`;

      const startUtc = fromZonedTime(localStart, TZ);
      const endUtc = fromZonedTime(localEnd, TZ);

      if (startUtc < now) continue;

      const key = `${startUtc.toISOString()}|${endUtc.toISOString()}`;
      if (existingKey.has(key)) continue;

      existingKey.add(key);

      toCreate.push({
        proId: pro.id,
        start: startUtc,
        end: endUtc,
        isBooked: false,
      });
    }
  }

  if (toCreate.length > 0) {
    await prisma.availabilitySlot.createMany({
      data: toCreate,
    });
  }

  return NextResponse.json(
    { ok: true, created: toCreate.length, daysAhead: safeDaysAhead },
    { status: 200 }
  );
}
