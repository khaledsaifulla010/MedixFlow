import AppointmentPage from "@/components/patient/AppointmentPage";

const page = () => {
  return (
    <div>
      <div className="mt-8">
        <h1 className=" font-bold text-3xl mb-4">Doctor List</h1>
        <AppointmentPage />
      </div>
    </div>
  );
};

export default page;
