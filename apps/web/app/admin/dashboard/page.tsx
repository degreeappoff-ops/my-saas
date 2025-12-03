import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../lib/auth";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || role !== "ADMIN") {
    redirect("/signin/ui");
  }

  return (
    <div className="max-w-2xl mx-auto py-16">
      <h1 className="text-2xl font-bold mb-4">Dashboard ADMIN</h1>
      <p>Bienvenue sur l&apos;espace d&apos;administration. (Contenu à venir)</p>
    </div>
  );
}
