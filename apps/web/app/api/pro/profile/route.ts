import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export const runtime = "nodejs";

// PATCH /api/pro/profile
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || role !== "PRO") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const userId = (session!.user as any).id;

  const body = await req.json();

  const {
    businessName,
    trade,
    city,
    zipcode,
    description,
    publicEmail,
    publicPhone,
  } = body as {
    businessName?: string;
    trade?: string;
    city?: string;
    zipcode?: string;
    description?: string;
    publicEmail?: string;
    publicPhone?: string;
  };

  try {
    const updated = await prisma.proProfile.update({
      where: { userId },
      data: {
        businessName,
        trade,
        city,
        zipcode,
        description,
        publicEmail,
        publicPhone,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating pro profile:", error);
    return NextResponse.json(
      { error: "Impossible de mettre à jour le profil" },
      { status: 500 }
    );
  }
}
