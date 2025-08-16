import MeetingDetailsPage from "@/components/patient/MeetingDetailsPage";

const MeetingPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Your Appointments</h1>
      <div>
        <MeetingDetailsPage />
      </div>
    </div>
  );
};

export default MeetingPage;
