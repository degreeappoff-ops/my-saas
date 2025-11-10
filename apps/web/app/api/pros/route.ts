import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET() {
  try {
    const pros = await prisma.professional.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ count: pros.length, professionals: pros });
  } catch (err) {
    console.error("Erreur /api/pros :", err);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
