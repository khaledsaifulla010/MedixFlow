import PatientAnalytics from "@/components/patient/PatientAnalytics";

const PatientDashboard = () => {
  return (
    <div className=" mt-6 px-4">
      <h1 className=" font-bold text-3xl">Welcome to Your Dashboard</h1>
      <div className="mt-12">
        <div>
          <PatientAnalytics />
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
