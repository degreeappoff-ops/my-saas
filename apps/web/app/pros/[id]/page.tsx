// apps/web/app/pros/[id]/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProBookingClient from "./pro-booking-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProDetailPage(props: {
  params: any; // important: compatible params object OU Promise
}) {
  // ✅ compatible Next: params peut être un objet OU une Promise
  const resolvedParams = await Promise.resolve(props.params);
  const proId = resolvedParams?.id as string | undefined;

  if (!proId || typeof proId !== "string" || proId.trim().length === 0) {
    notFound();
  }

  const pro = await prisma.proProfile.findUnique({
    where: { id: proId },
    include: {
      availabilities: {
        where: { isBooked: false },
        orderBy: { start: "asc" },
      },
    },
  });

  if (!pro || pro.status !== "APPROVED") {
    notFound();
  }

  // ⚠️ On passe au client des valeurs sérialisables (Date -> ISO string)
  const slots = pro.availabilities.map((s) => ({
    id: s.id,
    start: s.start.toISOString(),
    end: s.end.toISOString(),
  }));

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{pro.businessName}</h1>
        <Link href="/pros" className="underline">
          Retour
        </Link>
      </div>

      <div className="text-gray-700 space-y-1">
        <p>
          <strong>Métier :</strong> {pro.trade}
        </p>
        <p>
          <strong>Ville :</strong> {pro.city}
        </p>
        {pro.description && <p className="mt-2">{pro.description}</p>}
      </div>

      {/* ✅ La vraie brique “Prendre rendez-vous” */}
      <ProBookingClient slots={slots} />
    </div>
  );
}
