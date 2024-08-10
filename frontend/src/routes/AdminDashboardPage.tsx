import OwnershipRequestTable from "@/components/admin/OwnershipRequestTable";

const AdminDashboardPage = () => {
  return (
    <div className="bg-white rounded-md shadow px-6 py-4 flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <OwnershipRequestTable />
    </div>
  );
};

export default AdminDashboardPage;
