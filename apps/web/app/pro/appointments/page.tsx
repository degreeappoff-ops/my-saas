import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProAppointmentsClient from "./pro-appointments-client";

export default async function ProAppointmentsPage() {
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
        <p className="text-sm text-red-600">
          Profil professionnel introuvable.
        </p>
      </div>
    );
  }

  const appointments = await prisma.appointment.findMany({
    where: { proProfileId: proProfile.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      slot: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const forClient = appointments.map((a) => ({
    id: a.id,
    status: a.status as "PENDING" | "ACCEPTED" | "REJECTED",
    createdAt: a.createdAt.toISOString(),
    userName: a.user.name || "",
    userEmail: a.user.email,
    slotStart: a.slot ? a.slot.start.toISOString() : null,
    slotEnd: a.slot ? a.slot.end.toISOString() : null,
  }));

  return (
    <div className="max-w-4xl mx-auto py-10">
      <ProAppointmentsClient appointments={forClient} />
    </div>
  );
}
