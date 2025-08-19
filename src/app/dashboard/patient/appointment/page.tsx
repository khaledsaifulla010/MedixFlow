import AppointmentDetailsPage from "@/components/patient/AppointmentDetailsPage";

export default function AppointmentPage() {
  return (
    <div className="mt-4">
      <h1 className="text-3xl font-bold mb-6">
        Doctor Availabilities & Appointments
      </h1>
      <div>
        <AppointmentDetailsPage />
      </div>
    </div>
  );
}
