import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ProsPage() {
  const pros = await prisma.proProfile.findMany({
    where: { status: "APPROVED" },
    select: {
      id: true,
      businessName: true,
      trade: true,
      city: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-4">
      <h1 className="text-2xl font-bold">Trouver un professionnel</h1>

      {pros.map((pro) => (
        <div
          key={pro.id}
          className="border rounded p-4 flex justify-between items-center"
        >
          <div>
            <div className="font-semibold">{pro.businessName}</div>
            <div className="text-sm text-gray-600">
              {pro.trade} · {pro.city}
            </div>
          </div>

          <Link
            href={`/pros/${pro.id}`}
            className="px-4 py-2 border rounded"
          >
            Voir la fiche
          </Link>
        </div>
      ))}
    </div>
  );
}
