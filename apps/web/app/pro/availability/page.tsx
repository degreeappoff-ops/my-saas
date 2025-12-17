import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ProAvailabilityCalendar from "./pro-availability-calendar";

export default async function ProAvailabilityPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || role !== "PRO") {
    redirect("/signin/ui");
  }

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Mes disponibilités</h1>
        <p className="text-sm text-gray-600">
          Sélectionnez une plage pour créer un créneau (pas de 30 min). Cliquez sur un
          créneau disponible pour le supprimer.
        </p>
      </div>

      <ProAvailabilityCalendar />
    </div>
  );
}
