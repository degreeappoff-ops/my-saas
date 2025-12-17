import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(req: Request, { params }: { params: any }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || user?.role !== "PRO") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id as string | undefined;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const proProfile = await prisma.proProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!proProfile) {
    return NextResponse.json({ error: "ProProfile not found" }, { status: 404 });
  }

  const slot = await prisma.availabilitySlot.findUnique({
    where: { id },
    select: { id: true, proId: true, isBooked: true },
  });

  if (!slot) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (slot.proId !== proProfile.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (slot.isBooked) {
    return NextResponse.json(
      { error: "Impossible de supprimer un créneau réservé." },
      { status: 400 }
    );
  }

  await prisma.availabilitySlot.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
