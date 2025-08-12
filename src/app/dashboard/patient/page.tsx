import LogoutButton from "@/components/authComponents/LogoutButton";

const PatientDashboard = () => {
  return (
    <div className=" mt-12 flex items-center justify-between px-8">
      <h1 className=" font-bold text-3xl">Welcome to Patient Dashboard</h1>
      <LogoutButton />
    </div>
  );
};

export default PatientDashboard;
