import AllUsersDetails from "@/components/admin/AllUsersDetails";

const UsersPage = () => {
  return (
    <div className="mt-8">
      <h1 className="text-3xl font-bold">All Users List</h1>
      <div>
        <AllUsersDetails />
      </div>
    </div>
  );
};

export default UsersPage;
