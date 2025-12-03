import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../lib/auth";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || role !== "ADMIN") {
    redirect("/signin/ui");
  }

  return (
    <div className="max-w-2xl mx-auto py-16 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard ADMIN</h1>
      <p>Bienvenue sur l&apos;espace d&apos;administration.</p>

      <ul className="list-disc list-inside">
        <li>
          <Link href="/admin/pros" className="text-blue-600 underline">
            Gérer les professionnels (validation / blacklist)
          </Link>
        </li>
      </ul>
    </div>
  );
}
