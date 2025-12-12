import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function UserAppointmentsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  // ✅ accessible uniquement en USER
  if (!session || user?.role !== "USER") {
    redirect("/signin/ui");
  }

  const appointments = await prisma.appointment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      proProfile: true,
      slot: true,
    },
  });

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes rendez-vous</h1>
        <Link href="/pros" className="underline text-sm">
          Retour aux pros
        </Link>
      </div>

      {appointments.length === 0 ? (
        <p className="text-sm text-gray-600">Aucun rendez-vous pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <div key={a.id} className="border rounded p-4 bg-white space-y-1">
              <div className="font-semibold">{a.proProfile.businessName}</div>
              <div className="text-sm text-gray-600">
                {a.proProfile.trade} · {a.proProfile.city}
              </div>

              <div className="text-sm">
                <strong>Statut :</strong> {a.status}
              </div>

              <div className="text-sm">
                <strong>Créneau :</strong>{" "}
                {a.slot
                  ? `${new Date(a.slot.start).toLocaleString("fr-FR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })} → ${new Date(a.slot.end).toLocaleTimeString("fr-FR", {
                      timeStyle: "short",
                    })}`
                  : "Non précisé"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
