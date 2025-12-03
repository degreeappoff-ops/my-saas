import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany();
  const pros = await prisma.proProfile.findMany();

  return Response.json({
    usersCount: users.length,
    prosCount: pros.length,
  });
}
