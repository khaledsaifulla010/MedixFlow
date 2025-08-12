import LogoutButton from "@/components/authComponents/LogoutButton";

const AdminDashboard = () => {
  return (
    <div className=" mt-12 flex items-center justify-between px-8">
      <h1 className=" font-bold text-3xl">Welcome to Admin Dashboard</h1>
      <LogoutButton />
    </div>
  );
};

export default AdminDashboard;
