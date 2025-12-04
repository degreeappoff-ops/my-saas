import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProDashboardClient from "./pro-dashboard-client";

export default async function ProDashboardPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || role !== "PRO") {
    redirect("/signin/ui");
  }

  const userId = (session!.user as any).id; // on suppose que tu ajoutes l'id dans la session, comme pour le reste

  // On récupère le profil pro du user connecté
  const pro = await prisma.proProfile.findUnique({
    where: { userId },
  });

  // On sérialise pour le passer au composant client
  const proForClient = pro
    ? {
        id: pro.id,
        businessName: pro.businessName,
        trade: pro.trade,
        city: pro.city,
        zipcode: pro.zipcode,
        description: pro.description,
        publicEmail: pro.publicEmail,
        publicPhone: pro.publicPhone,
        status: pro.status as "PENDING" | "APPROVED" | "REJECTED",
      }
    : null;

  return (
    <div className="max-w-3xl mx-auto py-10">
      <ProDashboardClient proProfile={proForClient} />
    </div>
  );
}
