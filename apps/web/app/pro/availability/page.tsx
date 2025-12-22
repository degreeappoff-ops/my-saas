import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProAvailabilityClient from "./pro-availability-client";
import ProAvailabilityCalendar from "./pro-availability-calendar";
import ProAvailabilityToolbar from "./pro-availability-toolbar";

export default async function ProAvailabilityPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || user?.role !== "PRO") {
    redirect("/signin/ui");
  }

  const proProfile = await prisma.proProfile.findFirst({
    where: { userId: user.id },
  });

  if (!proProfile) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <p className="text-sm text-red-600">Profil professionnel introuvable.</p>
      </div>
    );
  }

  const dbSlots = await prisma.availabilitySlot.findMany({
    where: { proId: proProfile.id },
    orderBy: { start: "asc" },
  });

  const initialSlots = dbSlots.map((s) => ({
    id: s.id,
    start: s.start.toISOString(),
    end: s.end.toISOString(),
    isBooked: s.isBooked,
  }));

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-4">
      <ProAvailabilityToolbar />

      {/* Ta vue calendar + ta vue liste (selon ce que tu as gardé) */}
      <ProAvailabilityCalendar initialSlots={initialSlots} />
      <ProAvailabilityClient initialSlots={initialSlots} />
    </div>
  );
}
