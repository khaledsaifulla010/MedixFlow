import AllAppointmentTable from "@/components/admin/AllAppointmentTable";

const page = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mt-8">All Appointments</h1>
      <div>
        <AllAppointmentTable />
      </div>
    </div>
  );
};

export default page;
