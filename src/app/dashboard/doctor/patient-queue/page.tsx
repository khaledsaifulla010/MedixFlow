import PatientQueueDetails from "@/components/doctor/PatientQueueDetails";

export default function DoctorPatientQueue() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Patient Queue</h1>
      <PatientQueueDetails />
    </div>
  );
}
