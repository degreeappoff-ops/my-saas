import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// POST /api/appointments
// Body attendu : { slotId: string }
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  // 1) Sécurité : il faut être connecté en USER
  if (!session || user?.role !== "USER") {
    return NextResponse.json(
      { error: "Vous devez être connecté en tant qu'utilisateur." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { slotId } = body as { slotId?: string };

  // 2) Validation
  if (!slotId) {
    return NextResponse.json({ error: "slotId est requis." }, { status: 400 });
  }

  // 3) Vérifier slot
  const slot = await prisma.availabilitySlot.findUnique({
    where: { id: slotId },
  });

  if (!slot) {
    return NextResponse.json({ error: "Créneau introuvable." }, { status: 404 });
  }

  const proProfileId = slot.proId;

  // 4) Si déjà réservé
  if (slot.isBooked) {
    return NextResponse.json(
      { error: "Ce créneau est déjà réservé." },
      { status: 400 }
    );
  }

  // 5) Anti-doublon (sécurité)
  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      slotId,
      status: { in: ["PENDING", "ACCEPTED"] },
    },
  });

  if (existingAppointment) {
    return NextResponse.json(
      { error: "Un rendez-vous existe déjà pour ce créneau." },
      { status: 400 }
    );
  }

  // ✅ Booking instantané : on confirme immédiatement
  const appointment = await prisma.appointment.create({
    data: {
      userId: user.id,
      proProfileId,
      slotId,
      status: "ACCEPTED",
    },
  });

  // ✅ slot indisponible pour tout le monde
  await prisma.availabilitySlot.update({
    where: { id: slotId },
    data: { isBooked: true },
  });

  return NextResponse.json(
    {
      id: appointment.id,
      status: appointment.status,
      slotId: appointment.slotId,
      proProfileId: appointment.proProfileId,
    },
    { status: 201 }
  );
}

// PATCH /api/appointments (on garde : accept/reject pro existant)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user?.role !== "PRO") {
      return NextResponse.json(
        { error: "Vous devez être connecté en tant que professionnel." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { appointmentId, status } = body as {
      appointmentId?: string;
      status?: "ACCEPTED" | "REJECTED";
    };

    if (!appointmentId || !status) {
      return NextResponse.json(
        { error: "appointmentId et status sont requis." },
        { status: 400 }
      );
    }

    if (status !== "ACCEPTED" && status !== "REJECTED") {
      return NextResponse.json(
        { error: "status invalide (ACCEPTED ou REJECTED attendu)." },
        { status: 400 }
      );
    }

    const proProfile = await prisma.proProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!proProfile) {
      return NextResponse.json(
        { error: "Profil PRO introuvable." },
        { status: 404 }
      );
    }

    const appt = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { id: true, status: true, proProfileId: true, slotId: true },
    });

    if (!appt) {
      return NextResponse.json({ error: "Rendez-vous introuvable." }, { status: 404 });
    }

    if (appt.proProfileId !== proProfile.id) {
      return NextResponse.json({ error: "Accès interdit." }, { status: 403 });
    }

    // si tu veux garder une logique “pro décide”, sinon tu peux supprimer PATCH plus tard
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
      select: { id: true, status: true, slotId: true },
    });

    if (status === "REJECTED") {
      await prisma.availabilitySlot.update({
        where: { id: updated.slotId },
        data: { isBooked: false },
      });
    }

    return NextResponse.json({ id: updated.id, status: updated.status });
  } catch (e: any) {
    console.error("PATCH /api/appointments error:", e);
    return NextResponse.json(
      { error: e?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
