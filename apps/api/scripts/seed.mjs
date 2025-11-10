import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: { email: 'user1@example.com', name: 'Alice User', role: 'USER' }
  })

  const proUser = await prisma.user.upsert({
    where: { email: 'pro1@example.com' },
    update: {},
    create: { email: 'pro1@example.com', name: 'Bob Pro', role: 'PRO' }
  })

  const pro = await prisma.professional.upsert({
    where: { userId: proUser.id },
    update: {},
    create: {
      userId: proUser.id,
      profession: 'Plombier',
      city: 'Paris',
      areaKm: 20,
      bio: 'Intervention rapide, devis clair.'
    }
  })

  console.log({ user, proUser, pro })
}

main().catch(e => { console.error(e); process.exit(1) })
      .finally(async () => { await prisma.$disconnect() })
