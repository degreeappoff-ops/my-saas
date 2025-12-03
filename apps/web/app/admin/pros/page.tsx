import AdminProsTable from "./table";

export default function AdminProsPage() {
  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">
        Gestion des professionnels (ADMIN)
      </h1>
      <p className="text-gray-600 mb-6">
        Vous pouvez ici visualiser les comptes PRO, les approuver ou les
        bloquer.
      </p>
      <AdminProsTable />
    </div>
  );
}
