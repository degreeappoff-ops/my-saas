import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isOn30MinGrid(d: Date) {
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();
  const ms = d.getMilliseconds();
  return seconds === 0 && ms === 0 && (minutes === 0 || minutes === 30);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || user?.role !== "PRO") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const proProfile = await prisma.proProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!proProfile) {
    return NextResponse.json({ error: "ProProfile not found" }, { status: 404 });
  }

  const slots = await prisma.availabilitySlot.findMany({
    where: { proId: proProfile.id },
    orderBy: { start: "asc" },
    select: { id: true, start: true, end: true, isBooked: true },
  });

  // Format FullCalendar
  const events = slots.map((s) => ({
    id: s.id,
    title: s.isBooked ? "Réservé" : "Disponible",
    start: s.start.toISOString(),
    end: s.end.toISOString(),
    extendedProps: { isBooked: s.isBooked },
  }));

  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || user?.role !== "PRO") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const proProfile = await prisma.proProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!proProfile) {
    return NextResponse.json({ error: "ProProfile not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const { start, end } = body as { start?: string; end?: string };

  if (!start || !end) {
    return NextResponse.json({ error: "start et end requis" }, { status: 400 });
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return NextResponse.json({ error: "Dates invalides" }, { status: 400 });
  }

  if (endDate <= startDate) {
    return NextResponse.json({ error: "end doit être > start" }, { status: 400 });
  }

  // Durée minimale 30 minutes
  const durationMin = (endDate.getTime() - startDate.getTime()) / 60000;
  if (durationMin < 30) {
    return NextResponse.json({ error: "Durée minimale 30 minutes" }, { status: 400 });
  }

  // ✅ On force le grid 30 minutes
  if (!isOn30MinGrid(startDate) || !isOn30MinGrid(endDate)) {
    return NextResponse.json(
      { error: "Les créneaux doivent commencer/finir sur un pas de 30 minutes." },
      { status: 400 }
    );
  }

  // Empêcher overlaps pour ce PRO
  const overlap = await prisma.availabilitySlot.findFirst({
    where: {
      proId: proProfile.id,
      AND: [
        { start: { lt: endDate } }, // existing.start < new.end
        { end: { gt: startDate } }, // existing.end > new.start
      ],
    },
    select: { id: true },
  });

  if (overlap) {
    return NextResponse.json(
      { error: "Chevauchement avec un créneau existant." },
      { status: 400 }
    );
  }

  const created = await prisma.availabilitySlot.create({
    data: {
      proId: proProfile.id,
      start: startDate,
      end: endDate,
      isBooked: false,
    },
    select: { id: true, start: true, end: true, isBooked: true },
  });

  return NextResponse.json({
    event: {
      id: created.id,
      title: "Disponible",
      start: created.start.toISOString(),
      end: created.end.toISOString(),
      extendedProps: { isBooked: false },
    },
  });
}
