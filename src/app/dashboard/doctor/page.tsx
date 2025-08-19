import DoctorAnalytics from "@/components/doctor/DoctorAnalytics";

const DoctorDashboard = () => {
  return (
    <div className=" mt-6 px-4">
      <h1 className=" font-bold text-3xl">Welcome to Doctor Dashboard</h1>

      <div className="mt-16">
        <DoctorAnalytics />
      </div>
    </div>
  );
};

export default DoctorDashboard;
