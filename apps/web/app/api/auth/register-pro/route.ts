import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerProSchema } from "@/lib/validation/registerProSchema";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

// Important pour bcrypt : forcer le runtime Node
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validation côté serveur (toujours !)
    const parsed = registerProSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides (validation serveur)" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Email déjà existant ?
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 409 }
      );
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Création de l'utilisateur PRO
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "PRO", // enum Role dans Prisma
      },
    });

    // Création du profil pro associé
    await prisma.proProfile.create({
      data: {
        userId: user.id,
        businessName: data.businessName,
        trade: data.trade,
        city: data.city,
        zipcode: data.zipcode,
        description: data.description,
        publicEmail: data.publicEmail,
        publicPhone: data.publicPhone,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error register-pro:", error);

    // Cas typique : contrainte unique (email déjà utilisé) côté DB
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé (conflit en base)" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erreur interne lors de l'inscription" },
      { status: 500 }
    );
  }
}
