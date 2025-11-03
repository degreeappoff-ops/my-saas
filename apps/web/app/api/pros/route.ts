import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Eviter de recréer le client à chaud en dev
const globalForPrisma = global as unknown as { prisma: PrismaClient }
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // log: ['query'], // décommente pour debug
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function GET() {
  // Lis les 20 premiers pros
  const pros = await prisma.professional.findMany({
    take: 20,
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(pros)
}
