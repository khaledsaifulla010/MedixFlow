import AdminAnalytics from "@/components/admin/AdminAnalytics";

const AdminDashboard = () => {
  return (
    <div className=" mt-6 px-4">
      <h1 className="font-bold text-3xl">Welcome to Admin Dashboard</h1>

      <div>
        <AdminAnalytics />
      </div>
    </div>
  );
};

export default AdminDashboard;
