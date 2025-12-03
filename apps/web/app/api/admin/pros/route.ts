import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export const runtime = "nodejs";

// GET /api/admin/pros
export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const pros = await prisma.proProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(pros);
}

// PATCH /api/admin/pros
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();

  const { proProfileId, status } = body as {
    proProfileId?: string;
    status?: "PENDING" | "APPROVED" | "REJECTED";
  };

  if (!proProfileId || !status) {
    return NextResponse.json(
      { error: "proProfileId et status sont requis" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.proProfile.update({
      where: { id: proProfileId },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating proProfile status:", error);
    return NextResponse.json(
      { error: "Impossible de mettre à jour le statut" },
      { status: 500 }
    );
  }
}
