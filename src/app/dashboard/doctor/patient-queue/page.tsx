import PatientQueueDetails from "@/components/doctor/PatientQueueDetails";

export default function DoctorPatientQueue() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mt-4 mb-8">Patient Queue Table</h1>
      <PatientQueueDetails />
    </div>
  );
}
