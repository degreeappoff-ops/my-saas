import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProAvailabilityClient from "./pro-availability-client";

export default async function ProAvailabilityPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  // Protection : seulement les PRO ont accès à cette page
  if (!session || user?.role !== "PRO") {
    redirect("/signin/ui");
  }

  // On récupère le ProProfile du user connecté
  const proProfile = await prisma.proProfile.findFirst({
    where: { userId: user.id },
  });

  // Format de slots envoyé au client
  let slots: {
    id: string;
    start: string;
    end: string;
  }[] = [];

  if (proProfile) {
    // ⚠️ Ici on utilise bien proId (scalar) qui existe dans AvailabilitySlot
    const dbSlots = await prisma.availabilitySlot.findMany({
      where: { proId: proProfile.id },
      orderBy: { start: "asc" },
    });

    slots = dbSlots.map((s) => ({
      id: s.id,
      start: s.start.toISOString(),
      end: s.end.toISOString(),
    }));
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <ProAvailabilityClient initialSlots={slots} />
    </div>
  );
}
