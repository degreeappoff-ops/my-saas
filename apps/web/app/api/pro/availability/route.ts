import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET : liste des créneaux du PRO connecté
export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || user?.role !== "PRO") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const proProfile = await prisma.proProfile.findFirst({
    where: { userId: user.id },
  });

  if (!proProfile) {
    return NextResponse.json([]);
  }

  const slots = await prisma.availabilitySlot.findMany({
    where: { proId: proProfile.id }, // ✅ proId
    orderBy: { start: "asc" },
  });

  return NextResponse.json(slots);
}

// POST : ajout d'un créneau
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || user?.role !== "PRO") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const proProfile = await prisma.proProfile.findFirst({
    where: { userId: user.id },
  });

  if (!proProfile) {
    return NextResponse.json(
      { error: "Profil PRO introuvable" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { date, startTime, endTime } = body as {
    date?: string;
    startTime?: string;
    endTime?: string;
  };

  if (!date || !startTime || !endTime) {
    return NextResponse.json(
      { error: "date, startTime et endTime sont requis" },
      { status: 400 }
    );
  }

  const start = new Date(`${date}T${startTime}:00`);
  const end = new Date(`${date}T${endTime}:00`);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return NextResponse.json(
      { error: "Créneau invalide" },
      { status: 400 }
    );
  }

  const slot = await prisma.availabilitySlot.create({
    data: {
      proId: proProfile.id, // ✅ FK correcte
      start,
      end,
    },
  });

  return NextResponse.json(slot, { status: 201 });
}

// DELETE : suppression d'un créneau
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || user?.role !== "PRO") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const proProfile = await prisma.proProfile.findFirst({
    where: { userId: user.id },
  });

  if (!proProfile) {
    return NextResponse.json(
      { error: "Profil PRO introuvable" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { slotId } = body as { slotId?: string };

  if (!slotId) {
    return NextResponse.json(
      { error: "slotId requis" },
      { status: 400 }
    );
  }

  // Sécurité : on ne supprime que les créneaux appartenant à ce PRO
  await prisma.availabilitySlot.deleteMany({
    where: {
      id: slotId,
      proId: proProfile.id, // ✅ on vérifie que c'est bien son slot
    },
  });

  return NextResponse.json({ ok: true });
}
