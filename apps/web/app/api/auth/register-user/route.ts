import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerUserSchema } from "@/lib/validation/registerUserSchema";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validation côté serveur
    const parsed = registerUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides (validation serveur)" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Vérifier si l'email est déjà utilisé
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

    // Création de l'utilisateur "classique"
    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "USER", // enum Role dans Prisma
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error register-user:", error);

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
